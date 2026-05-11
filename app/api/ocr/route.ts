import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:image/png;base64,${buffer.toString("base64")}`;

    const result = await Tesseract.recognize(base64, "eng", {
      logger: () => {}
    });

    return NextResponse.json({
      text: result.data.text.slice(0, 2000)
    });
  } catch (err) {
    return NextResponse.json({
      error: "OCR failed"
    });
  }
}
