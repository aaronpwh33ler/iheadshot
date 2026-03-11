import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This endpoint is called by Vercel Cron to prevent Supabase free tier from pausing
// Runs Mon & Thu at 9am UTC — a simple DB query / REST ping is enough to register activity
// Pings ALL Supabase projects across accounts to keep them alive

const EXTERNAL_SUPABASE_PROJECTS = [
  {
    name: "trailancer",
    url: "https://eiaaeeizodlrvasjrzpg.supabase.co",
  },
  {
    name: "ideamrr",
    url: "https://lcumqypysqcmkxottxuy.supabase.co",
  },
];

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (optional security)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow requests without CRON_SECRET set (for manual testing)
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results: Record<string, string> = {};

  // 1. Ping iHeadshot (this project) via Supabase client
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("orders")
      .select("id")
      .limit(1);

    results["iheadshot"] = error ? `error: ${error.message}` : "ok";
  } catch (err) {
    results["iheadshot"] = `error: ${err}`;
  }

  // 2. Ping external Supabase projects via REST health check
  for (const project of EXTERNAL_SUPABASE_PROJECTS) {
    try {
      const response = await fetch(`${project.url}/rest/v1/`, {
        method: "HEAD",
        headers: {
          "apikey": "placeholder",
        },
      });
      // Any response (even 401) means the project is alive
      results[project.name] = response.status < 500 ? "ok" : `error: ${response.status}`;
    } catch (err) {
      results[project.name] = `error: ${err}`;
    }
  }

  const allOk = Object.values(results).every((r) => r === "ok");
  const timestamp = new Date().toISOString();

  console.log("Keep-alive ping results:", JSON.stringify(results), "at", timestamp);

  return NextResponse.json({
    status: allOk ? "ok" : "partial",
    message: "Supabase keep-alive ping completed",
    projects: results,
    timestamp,
  });
}
