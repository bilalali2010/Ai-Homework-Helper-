import Tesseract from "tesseract.js";

export async function extractText(imageBase64: string) {
  const result = await Tesseract.recognize(imageBase64, "eng");
  return result.data.text;
}
