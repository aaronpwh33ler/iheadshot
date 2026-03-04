import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This endpoint is called by Vercel Cron to prevent Supabase free tier from pausing
// Runs weekly — a simple DB query is enough to register activity

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (optional security)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow requests without CRON_SECRET set (for manual testing)
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Simple query to keep the database active
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Keep-alive query failed:", error);
      return NextResponse.json(
        { status: "error", message: error.message, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    console.log("Keep-alive ping successful at", new Date().toISOString());
    return NextResponse.json({
      status: "ok",
      message: "Supabase keep-alive ping successful",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Keep-alive error:", err);
    return NextResponse.json(
      { status: "error", message: "Internal error", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
