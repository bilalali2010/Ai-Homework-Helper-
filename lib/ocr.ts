export async function extractText(imageBase64: string) {
  try {
    const Tesseract = (await import("tesseract.js")).default;

    const result = await Tesseract.recognize(imageBase64, "eng", {
      logger: () => {}
    });

    let text = result.data.text || "";

    // Clean OCR noise
    text = text
      .replace(/\n{2,}/g, "\n")
      .replace(/[^\x20-\x7E\n]/g, "")
      .trim()
      .slice(0, 2500);

    return text || "Unable to extract text clearly";
  } catch (err) {
    console.error("OCR FAILED:", err);
    return "OCR failed. Please upload a clearer image.";
  }
}
