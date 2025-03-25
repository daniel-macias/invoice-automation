// app/api/upload/route.ts
import { NextResponse } from "next/server";

const WEBHOOK_PDF = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PDF;
const WEBHOOK_IMAGE = process.env.NEXT_PUBLIC_N8N_WEBHOOK_IMAGE;

export async function POST(request: Request) {

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      console.log("No file uploaded or invalid file");
      return NextResponse.json({ message: "No file uploaded or invalid file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const webhookUrl = file.type.includes("pdf") ? WEBHOOK_PDF : WEBHOOK_IMAGE;

    if (!webhookUrl) {
      console.error("Webhook URL is missing!");
      return NextResponse.json({ message: "Webhook URL is missing" }, { status: 500 });
    }

    console.log(`Forwarding file to: ${webhookUrl}`);

    // Send file as binary to webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
      body: fileBuffer,
    });

    // Check webhook response
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Webhook response error:", errorText);
      return NextResponse.json({ message: "Error from webhook", error: errorText }, { status: 500 });
    }

    // Parse and return webhook response to frontend
    const responseData = await webhookResponse.json();
    console.log("Webhook response:", responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error("Error during file upload:", error);
    return NextResponse.json({ message: "Error uploading file", error: String(error) }, { status: 500 });
  }
}
