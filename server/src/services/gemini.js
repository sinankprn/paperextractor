import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";

// Lazy-initialize client
let ai = null;
function getClient() {
  if (!ai) {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey)
      throw new Error(
        "Missing GOOGLE_API_KEY or GEMINI_API_KEY in environment"
      );
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// Map user data types to Gemini Schema Types
const TYPE_MAPPING = {
  text: Type.STRING,
  number: Type.NUMBER,
  boolean: Type.BOOLEAN,
  date: Type.STRING, // Dates are best extracted as ISO strings
  list: Type.ARRAY, // Special handling in schema builder
};

function buildExtractionSchema(normalizedFields) {
  const fieldProperties = {};

  normalizedFields.forEach((field) => {
    const safeName = field.name.replace(/[^a-zA-Z0-9_]/g, "_");
    const schemaType = TYPE_MAPPING[field.dataType] || Type.STRING;

    // For list fields, each item should be a separate value entry, not an array
    // This allows each list item to have its own snippet and location
    let valueSchema;
    if (field.dataType === "list") {
      // List items are returned as individual strings in separate value objects
      valueSchema = {
        type: Type.STRING,
        description: `A single item from the ${field.name} list`,
        nullable: true,
      };
    } else {
      valueSchema = {
        type: schemaType,
        description: `The extracted value for ${field.name}`,
        nullable: true,
      };
    }

    fieldProperties[safeName] = {
      type: Type.OBJECT,
      properties: {
        values: {
          type: Type.ARRAY,
          description:
            field.dataType === "list"
              ? `Each list item as a separate entry with its own snippet and location. Do NOT group items into an array.`
              : "All distinct instances of this field found in the document",
          items: {
            type: Type.OBJECT,
            properties: {
              value: valueSchema,
              snippet: {
                type: Type.STRING,
                description:
                  "The immediate surrounding text/context to verify the extraction",
              },
              confidence: { type: Type.NUMBER },
            },
            required: ["value", "confidence", "snippet"],
          },
        },
      },
      required: ["values"],
    };
  });

  return {
    type: Type.OBJECT,
    properties: fieldProperties,
    required: normalizedFields.map((f) =>
      f.name.replace(/[^a-zA-Z0-9_]/g, "_")
    ),
  };
}

async function convertPdfToLayoutMarkdown(uploadedFileUri) {
  const client = getClient();
  console.log("Stage 1: Converting PDF to Layout Markdown (Native Vision)...");

  const response = await client.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: uploadedFileUri,
              mimeType: "application/pdf",
            },
            // THIS activates the high-fidelity native vision
            mediaResolution: { level: "media_resolution_high" },
          },
          {
            text: "You are an advanced Document Intelligence Engine. Perform a high-accuracy visual-spatial transcription. Reconstruct all tables, headers, and columns into precise Markdown. Output only the markdown.",
          },
        ],
      },
    ],
  });

  return response.text;
}

export async function extractFieldsFromDocument(pdfPath, fields) {
  const client = getClient();

  // Normalize fields
  const normalizedFields = fields.map((field) =>
    typeof field === "string"
      ? { name: field, metadata: "", dataType: "text" }
      : {
          name: field.name,
          metadata: field.metadata || "",
          dataType: field.dataType || "text",
        }
  );

  let uploadedFile = null;

  try {
    // 1. Upload PDF directly
    console.log(`Uploading PDF for extraction: ${pdfPath}`);
    uploadedFile = await client.files.upload({
      file: pdfPath,
      config: { mimeType: "application/pdf" },
    });
    console.log(`Uploaded PDF: ${uploadedFile.uri}`);

    // --- STAGE 1: Derendered to Markdown ---
    const layoutMarkdown = await convertPdfToLayoutMarkdown(uploadedFile.uri);
    console.log("Stage 1 Complete. Markdown Context Generated.");

    // 2. Build Strict Schema
    const schema = buildExtractionSchema(normalizedFields);

    // --- STAGE 2: Simplified Field Extraction ---
    const fieldContexts = normalizedFields
      .map((f) => `- "${f.name}" (${f.dataType}): ${f.metadata}`)
      .join("\n");

    const prompt = `
      You are an expert data extractor. Below is a Markdown representation of a document.
      Your task is to extract specific fields from this text with 100% accuracy.

      ## Text Context (Markdown)
      \`\`\`markdown
      ${layoutMarkdown}
      \`\`\`

      ## Fields to Extract
      Each field below may include specific instructions (after the colon). Pay careful attention to these per-field instructions.
      ${fieldContexts}

      ## Rules
      - If a value is NOT found in the text, return an empty 'values' array for that field.
      - 'snippet' field is MANDATORY: quote 3-5 words EXACTLY as they appear in the text to prove you found it.
      - Be EXHAUSTIVE: find ALL instances of the requested fields.
      - For 'list' type fields: Return each list item as a SEPARATE value object with its own snippet and location. Do NOT combine multiple items into a single array value.
        Example: If extracting "Dates (list)" and you find three dates, return THREE separate value objects, each with one date and its own snippet.
      - When a field includes "IMPORTANT" instructions about focusing on main study vs cited studies, follow those instructions strictly.
    `;

    console.log(
      "Sending request to Gemini-3-pro (Stage 2: Text-Only Extraction)..."
    );
    const response = await client.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.0,
      },
    });

    const parsed = JSON.parse(response.text);
    const extractions = transformResponse(parsed, normalizedFields);
    return { extractions, ocrText: layoutMarkdown };
  } catch (error) {
    console.error("Extraction failed:", error);
    throw error;
  } finally {
    // 5. Cleanup
    if (uploadedFile) {
      console.log("Cleaning up remote file...");
      client.files
        .delete({ name: uploadedFile.name })
        .catch((e) => console.error("Cleanup error:", e));
    }
  }
}

// Helper: Transform raw JSON back to clean API format
function transformResponse(rawParsed, fields) {
  return fields.map((field) => {
    const safeName = field.name.replace(/[^a-zA-Z0-9_]/g, "_");
    const data = rawParsed[safeName];

    // Default empty structure
    if (!data || !data.values || data.values.length === 0) {
      return {
        fieldName: field.name,
        values: [],
        found: false,
      };
    }

    return {
      fieldName: field.name,
      found: true,
      values: data.values.map((v) => ({
        value: v.value,
        snippet: v.snippet, // used for highlighting on the hover event
        confidence: v.confidence, // not used currently
      })),
    };
  });
}
