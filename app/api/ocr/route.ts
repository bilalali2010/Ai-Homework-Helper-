import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import sharp from "sharp";

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

    // =========================
    // READ IMAGE
    // =========================
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // =========================
    // IMAGE PREPROCESSING
    // =========================
    const processedImage = await sharp(buffer)
      .grayscale()
      .normalize()
      .sharpen()
      .resize({
        width: 1800,
        withoutEnlargement: true
      })
      .png()
      .toBuffer();

    const base64 = `data:image/png;base64,${processedImage.toString(
      "base64"
    )}`;

    // =========================
    // OCR
    // =========================
    const result = await Tesseract.recognize(
      base64,
      "eng",
      {
        logger: () => {},
        tessedit_pageseg_mode: "6"
      }
    );

    // =========================
    // CLEAN TEXT
    // =========================
    const cleanedText = result.data.text
      .replace(/\n{2,}/g, "\n")
      .replace(/[^\x20-\x7E\n]/g, "")
      .trim()
      .slice(0, 4000);

    return NextResponse.json({
      success: true,
      text: cleanedText
    });
  } catch (err: any) {
    console.log("OCR ERROR:", err);

    return NextResponse.json({
      success: false,
      error: err.message || "OCR failed"
    });
  }
}
