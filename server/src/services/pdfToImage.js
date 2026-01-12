import { pdf } from "pdf-to-img";
import fs from "fs/promises";

export async function convertPdfToImages(pdfPath) {
  try {
    const images = [];
    const document = await pdf(pdfPath, { scale: 2.0 });

    for await (const image of document) {
      // Convert buffer to base64
      const base64 = image.toString("base64");
      images.push(base64);
    }

    return images;
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw new Error(`Failed to convert PDF to images: ${error.message}`);
  }
}
