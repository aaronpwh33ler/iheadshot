import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, updateOrderStatus } from "@/lib/supabase";
import { sendHeadshotsReady, sendGenerationFailed } from "@/lib/resend";

interface AstriaWebhookPayload {
  id: number;
  type: "tune" | "prompt";
  status: string;
  title?: string;
  images?: string[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: AstriaWebhookPayload = await request.json();

    console.log("Astria webhook received:", payload);

    const supabase = createAdminSupabaseClient();

    if (payload.type === "tune") {
      // Training completed or failed
      const { data: job, error: jobError } = await supabase
        .from("training_jobs")
        .select("*, orders(*)")
        .eq("astria_tune_id", payload.id.toString())
        .single();

      if (jobError || !job) {
        console.error("Training job not found:", payload.id);
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      if (payload.status === "completed") {
        // Trigger generation
        const generateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: job.order_id,
              tuneId: payload.id,
            }),
          }
        );

        if (!generateResponse.ok) {
          console.error("Failed to trigger generation");
        }
      } else if (payload.status === "failed") {
        // Update status and notify
        await supabase
          .from("training_jobs")
          .update({
            status: "failed",
            error_message: payload.error || "Training failed",
          })
          .eq("id", job.id);

        await updateOrderStatus(job.order_id, "failed");

        if (job.orders?.email) {
          await sendGenerationFailed(job.orders.email, job.order_id);
        }
      }
    } else if (payload.type === "prompt") {
      // Image generation completed
      if (payload.status === "completed" && payload.images) {
        // Find the order associated with this tune
        // We need to get the tune ID from the prompt ID
        // For now, we'll extract order info from the prompt title if available

        // Save generated images
        const { data: jobs } = await supabase
          .from("training_jobs")
          .select("order_id, id")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1);

        if (jobs && jobs.length > 0) {
          const job = jobs[0];

          // Insert generated images
          const imageRecords = payload.images.map((url) => ({
            order_id: job.order_id,
            training_job_id: job.id,
            image_url: url,
            prompt: payload.title,
          }));

          await supabase.from("generated_images").insert(imageRecords);

          // Check if all images are generated
          const { count } = await supabase
            .from("generated_images")
            .select("*", { count: "exact", head: true })
            .eq("order_id", job.order_id);

          // Get order to check expected count
          const { data: order } = await supabase
            .from("orders")
            .select("headshot_count, email")
            .eq("id", job.order_id)
            .single();

          if (order && count && count >= order.headshot_count) {
            // All images generated
            await updateOrderStatus(job.order_id, "completed");

            if (order.email) {
              await sendHeadshotsReady(order.email, job.order_id, count);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Astria webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
