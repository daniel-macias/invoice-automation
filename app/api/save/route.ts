import { NextResponse } from "next/server";

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

export async function POST(req: Request) {
  if (!WEBHOOK_URL) {
    console.error("GOOGLE_SHEETS_WEBHOOK_URL is not defined in environment variables.");
    return NextResponse.json({ success: false, message: "Webhook URL is missing" }, { status: 500 });
  }

  try {
    const data = await req.json();
    console.log("Forwarding data to webhook:", data);

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await webhookResponse.json();

    return NextResponse.json({ success: true, message: "Data forwarded successfully", result });
  } catch (error) {
    console.error("Error forwarding data:", error);
    return NextResponse.json({ success: false, message: "Error forwarding data" }, { status: 500 });
  }
}
