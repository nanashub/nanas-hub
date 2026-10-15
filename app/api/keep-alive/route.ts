import { createClient } from "@supabase/supabase-js";

// Called once a day by Vercel (see vercel.json) so the free Supabase project
// always has some activity and doesn't pause after 7 quiet days.
// It only reads one public row, so it's harmless if anyone else calls it.
export async function GET(request: Request) {
  // If a CRON_SECRET is set in Vercel, only Vercel's scheduler may call this.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Not allowed" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { error } = await supabase.from("professional_profiles").select("id").limit(1);

  if (error) {
    console.error("Keep-alive query failed:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, checkedAt: new Date().toISOString() });
}
