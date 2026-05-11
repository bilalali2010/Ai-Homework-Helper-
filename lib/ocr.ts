import Tesseract from "tesseract.js";

export async function extractText(image: string) {
  const result = await Tesseract.recognize(image, "eng");

  let text = result.data.text;

  // cleanup layer
  text = text
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}
