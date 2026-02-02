import { createClient } from "@supabase/supabase-js";

// Types for our database tables
export interface Order {
  id: string;
  user_id?: string;
  email: string;
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  amount: number;
  tier: "basic" | "pro" | "premium";
  headshot_count: number;
  status: "pending" | "paid" | "training" | "generating" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface TrainingJob {
  id: string;
  order_id: string;
  astria_tune_id?: string;
  status: "pending" | "training" | "completed" | "failed";
  model_url?: string;
  created_at: string;
  completed_at?: string;
}

export interface GeneratedImage {
  id: string;
  order_id: string;
  training_job_id: string;
  image_url: string;
  prompt?: string;
  style?: string;
  created_at: string;
}

export interface Upload {
  id: string;
  order_id: string;
  file_path: string;
  file_name?: string;
  created_at: string;
}

// Admin client with service role key (for webhooks and background jobs)
// Only use on server-side!
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase environment variables for admin client");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper functions for database operations
export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): Promise<boolean> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    return false;
  }
  return true;
}

export async function getTrainingJob(orderId: string): Promise<TrainingJob | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("training_jobs")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error) {
    console.error("Error fetching training job:", error);
    return null;
  }
  return data;
}

export async function getGeneratedImages(orderId: string): Promise<GeneratedImage[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("generated_images")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching generated images:", error);
    return [];
  }
  return data || [];
}

export async function getUploads(orderId: string): Promise<Upload[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching uploads:", error);
    return [];
  }
  return data || [];
}
