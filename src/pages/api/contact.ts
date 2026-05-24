import type { APIRoute } from "astro";
import { env as cfEnv } from "cloudflare:workers";
import { Resend } from "resend";

const env = cfEnv as { RESEND_API_KEY?: string };

export const prerender = false;

const TO_ADDRESS = "hi@itsjan.dev";
const FROM_ADDRESS = "itsjan.dev contact <hi@itsjan.dev>";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 5000;
const MIN_MESSAGE = 10;

type Payload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
};

export const POST: APIRoute = async ({ request }) => {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  if (body.company && body.company.trim().length > 0) {
    return json({ ok: true }, 200);
  }

  const name = (body.name ?? "").trim().slice(0, MAX_NAME);
  const email = (body.email ?? "").trim().slice(0, MAX_EMAIL);
  const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE);

  if (!email || !message) {
    return json({ error: "Email and message are required." }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ error: "That email address doesn't look right." }, 400);
  }
  if (message.length < MIN_MESSAGE) {
    return json({ error: "Message is too short — give me at least a sentence." }, 400);
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured");
    return json(
      { error: "Mailer isn't configured yet. Please email hi@itsjan.dev directly." },
      500,
    );
  }

  const resend = new Resend(apiKey);
  const senderLabel = name ? `${name} <${email}>` : email;
  const subject = `[itsjan.dev] ${name || "anonymous"} contacted you`;

  const text =
    `From: ${senderLabel}\n` +
    `Sent: ${new Date().toISOString()}\n` +
    `\n` +
    `${message}\n` +
    `\n` +
    `— sent via the itsjan.dev contact form`;

  const html = `
<table style="font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.65;color:#181410;max-width:560px;border-collapse:collapse;">
  <tr><td style="padding:0 0 12px;">
    <p style="color:#737373;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">itsjan.dev &middot; contact form</p>
    <p style="margin:0;font-size:15px;"><strong>${escapeHtml(name || "Anonymous")}</strong> &lt;<a href="mailto:${escapeHtml(email)}" style="color:#f59e0b;text-decoration:none;">${escapeHtml(email)}</a>&gt;</p>
  </td></tr>
  <tr><td style="padding:14px 0;border-top:1px solid #e5e0d4;border-bottom:1px solid #e5e0d4;">
    <div style="white-space:pre-wrap;font-size:15px;line-height:1.7;">${escapeHtml(message)}</div>
  </td></tr>
  <tr><td style="padding:12px 0 0;color:#737373;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
    sent ${escapeHtml(new Date().toISOString())}
  </td></tr>
</table>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: email,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return json(
        { error: "Send failed. Please email hi@itsjan.dev directly." },
        502,
      );
    }

    return json({ ok: true, id: data?.id }, 200);
  } catch (err) {
    console.error("Send threw:", err);
    return json(
      { error: "Send failed. Please email hi@itsjan.dev directly." },
      500,
    );
  }
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
