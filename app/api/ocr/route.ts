import { NextResponse } from "next/server";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64 = buffer.toString("base64");

    // 🔥 CLOUD OCR (FREE + RELIABLE fallback approach)
    const response = await fetch(
      "https://api.ocr.space/parse/image",
      {
        method: "POST",
        headers: {
          apikey: "helloworld"
        },
        body: new URLSearchParams({
          base64Image: `data:image/png;base64,${base64}`,
          language: "eng",
          isOverlayRequired: "false"
        })
      }
    );

    const data = await response.json();

    const text =
      data?.ParsedResults?.[0]?.ParsedText || "";

    return NextResponse.json({
      success: true,
      text: text.trim()
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "OCR failed"
    });
  }
}
