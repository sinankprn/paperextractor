import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { extractFieldsFromDocument } from "../services/gemini.js";
import { convertPdfToImages } from "../services/pdfToImage.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

router.post("/", upload.single("file"), async (req, res) => {
  const uploadedFile = req.file;

  try {
    if (!uploadedFile) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const fieldsRaw = req.body.fields;
    if (!fieldsRaw) {
      return res.status(400).json({ error: "No fields specified for extraction" });
    }

    const fields = JSON.parse(fieldsRaw);
    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: "Fields must be a non-empty array" });
    }

    console.log("Processing PDF...");

    // Convert PDF to images FIRST
    console.log("Converting PDF to images...");
    const images = await convertPdfToImages(uploadedFile.path);
    console.log(`Converted PDF to ${images.length} images`);

    if (images.length === 0) {
      throw new Error("PDF conversion resulted in zero images");
    }

    // Save images temporarily for Gemini upload
    const tempImageDir = path.join(process.cwd(), "temp-images");
    await fs.mkdir(tempImageDir, { recursive: true });

    const imagePaths = [];
    try {
      const timestamp = Date.now();
      for (let i = 0; i < images.length; i++) {
        const imagePath = path.join(tempImageDir, `${timestamp}-page-${i + 1}.png`);
        await fs.writeFile(imagePath, Buffer.from(images[i], 'base64'));
        imagePaths.push(imagePath);
      }
      console.log(`Saved ${imagePaths.length} temporary image files`);

      // Extract fields from PDF using Gemini
      console.log("Extracting fields from PDF...");
      const extractionResult = await extractFieldsFromDocument(uploadedFile.path, fields);
      console.log(`Extracted ${extractionResult.extractions.length} fields`);
      console.log("Extraction result:", JSON.stringify(extractionResult, null, 2).substring(0, 500));

      // Clean up temporary image files
      console.log("Cleaning up temp image files...");
      for (const imagePath of imagePaths) {
        await fs.unlink(imagePath).catch(() => { });
      }
      await fs.rmdir(tempImageDir).catch(() => { });

      // Clean up uploaded PDF file
      await fs.unlink(uploadedFile.path);
      console.log("Cleanup complete");

      // Calculate response size
      const responseData = {
        images: images,
        extractions: extractionResult.extractions,
        ocrText: extractionResult.ocrText,
      };
      const responseSize = JSON.stringify(responseData).length;
      console.log(`Sending response (${(responseSize / 1024 / 1024).toFixed(2)} MB)...`);

      res.json(responseData);
      console.log("Response sent successfully");
    } catch (innerError) {
      // Clean up temp files on error
      for (const imagePath of imagePaths) {
        await fs.unlink(imagePath).catch(() => { });
      }
      await fs.rmdir(tempImageDir).catch(() => { });
      throw innerError;
    }
  } catch (error) {
    console.error("Extraction error:", error);

    // Clean up on error
    if (uploadedFile) {
      await fs.unlink(uploadedFile.path).catch(() => { });
    }

    res.status(500).json({ error: error.message || "Failed to process document" });
  }
});

export default router;
