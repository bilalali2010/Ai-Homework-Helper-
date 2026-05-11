export async function extractText(imageBase64: string) {
  const Tesseract = (await import("tesseract.js")).default;

  const result = await Tesseract.recognize(imageBase64, "eng", {
    logger: () => {}
  });

  return result.data.text.slice(0, 2000);
}
