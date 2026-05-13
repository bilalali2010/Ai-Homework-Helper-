import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No image uploaded"
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCR_SPACE_API_KEY!
      },
      body: new URLSearchParams({
        base64Image: `data:image/png;base64,${base64}`,
        language: "eng",
        isOverlayRequired: "false"
      })
    });

    const data = await response.json();

    const text =
      data?.ParsedResults?.[0]?.ParsedText || "";

    return NextResponse.json({
      success: true,
      text: text.trim().slice(0, 4000)
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "OCR failed"
    });
  }
}
