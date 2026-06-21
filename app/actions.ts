"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export type WaitlistResult =
  | { success: true }
  | { success: false; error: string };

export async function joinWaitlist(
  formData: FormData
): Promise<WaitlistResult> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const userType = (formData.get("userType") as string | null) || "client";

  if (!email || !email.includes("@") || email.length < 5) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  if (userType !== "client" && userType !== "pro") {
    return {
      success: false,
      error: "Please pick whether you're a client or a pro.",
    };
  }

  const { error } = await supabase
    .from("waitlist")
    .insert({ email, user_type: userType });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "You're already on the waitlist — see you at launch!",
      };
    }
    console.error("Waitlist insert failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again in a moment.",
    };
  }

  return { success: true };
}