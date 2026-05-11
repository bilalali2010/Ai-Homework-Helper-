import { NextResponse } from "next/server";
import { extractText } from "@/lib/ocr";
import { solveWithAI } from "@/lib/aiRouter";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64 = `data:image/png;base64,${buffer.toString("base64")}`;

    const text = await extractText(base64);
    const solution = await solveWithAI(text);

    return NextResponse.json({
      success: true,
      extractedText: text,
      solution
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Failed to process image"
    });
  }
}
