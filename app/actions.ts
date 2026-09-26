"use server";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export type WaitlistResult =
  | { success: true }
  | { success: false; error: string };

export async function joinWaitlist(formData: FormData): Promise<WaitlistResult> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const userType = (formData.get("userType") as string | null) || "client";

  if (!email || !email.includes("@") || email.length < 5) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (userType !== "client" && userType !== "pro") {
    return { success: false, error: "Please pick whether you're a client or a pro." };
  }

  const { error } = await supabase.from("waitlist").insert({ email, user_type: userType });
  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You're already on the waitlist — see you at launch!" };
    }
    return { success: false, error: "Something went wrong. Please try again in a moment." };
  }
  return { success: true };
}

type BookingEmailData = {
  toEmail: string;
  toName: string;
  otherPartyName: string;
  service: string;
  requestedDatetime: string;
  location: string;
  type: "requested" | "accepted" | "declined";
  pricePence?: number;
  durationMinutes?: number;
};

export async function sendBookingEmail(data: BookingEmailData) {
  try {
    const dateStr = new Date(data.requestedDatetime).toLocaleString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    let subject = "";
    let intro = "";
    let extras = "";
    let cta = "";

    if (data.type === "requested") {
      subject = `New booking request from ${data.otherPartyName}`;
      intro = `<strong>${data.otherPartyName}</strong> has requested a booking with you on Nana's Hub.`;
      cta = `<a href="https://nanashub.co.uk/pro/dashboard" style="display:inline-block;background:#3D2F2A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Open dashboard</a>`;
    } else if (data.type === "accepted") {
      subject = `${data.otherPartyName} accepted your booking`;
      intro = `Great news — <strong>${data.otherPartyName}</strong> has accepted your booking request.`;
      if (data.pricePence) extras += `<p style="margin:6px 0;"><strong>Price:</strong> £${(data.pricePence / 100).toFixed(2)}</p>`;
      if (data.durationMinutes) extras += `<p style="margin:6px 0;"><strong>Duration:</strong> ${data.durationMinutes} min</p>`;
      cta = `<a href="https://nanashub.co.uk/account" style="display:inline-block;background:#3D2F2A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View account</a>`;
    } else {
      subject = `${data.otherPartyName} couldn't take your booking`;
      intro = `Unfortunately, <strong>${data.otherPartyName}</strong> couldn't take your booking this time. Have a browse for another pro.`;
      cta = `<a href="https://nanashub.co.uk/pros" style="display:inline-block;background:#3D2F2A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Browse pros</a>`;
    }

    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px;background:#F5EDE6;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-family:Georgia,serif;font-size:22px;color:#B8746E;letter-spacing:4px;font-weight:600;">NANA'S HUB</span>
        </div>
        <h1 style="color:#2A2521;font-size:26px;margin:0 0 16px 0;">${subject}</h1>
        <p style="color:#3D2F2A;font-size:15px;line-height:1.6;">Hi ${data.toName},</p>
        <p style="color:#3D2F2A;font-size:15px;line-height:1.6;">${intro}</p>
        <div style="background:white;padding:20px;border-radius:12px;margin:20px 0;font-size:14px;color:#3D2F2A;">
          <p style="margin:6px 0;"><strong>Service:</strong> ${data.service}</p>
          <p style="margin:6px 0;"><strong>When:</strong> ${dateStr}</p>
          <p style="margin:6px 0;"><strong>Location:</strong> ${data.location}</p>
          ${extras}
        </div>
        <div style="text-align:center;margin:30px 0;">${cta}</div>
        <p style="color:#6B5F58;font-size:12px;text-align:center;margin-top:30px;">Sent by Nana's Hub · nanashub.co.uk</p>
      </div>
    `;

    await resend.emails.send({
      from: "Nana's Hub <onboarding@resend.dev>",
      to: data.toEmail,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false };
  }
}