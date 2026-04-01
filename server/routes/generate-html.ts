import { RequestHandler } from "express";
import { parseDocument } from "../services/document-parser.js";
import { generateHTML, generateHTMLDocument, type HTMLGeneratorOptions } from "../services/html-generator.js";

export interface GenerateHTMLRequest {
  document: string;
  options?: HTMLGeneratorOptions;
  format?: "fragment" | "document"; // fragment = HTML snippet, document = full HTML
}

export type ActionResult = { statusCode: number; body: object };

export async function generateHTMLAction(body: unknown): Promise<ActionResult> {
  try {
    const b = body as GenerateHTMLRequest | undefined;
    if (!b || typeof b !== "object") {
      return { statusCode: 400, body: { error: "Invalid request body", details: "Body must be a JSON object" } };
    }
    const { document, options = {}, format = "fragment" } = b;
    if (!document || typeof document !== "string") {
      return { statusCode: 400, body: { error: "Missing 'document' field in request body", details: "Document must be a non-empty string" } };
    }

    // Log the imageUrls for debugging
    if (options.imageUrls) {
      console.log("Received imageUrls:", JSON.stringify(options.imageUrls, null, 2));
    }

    // Log featured image URL
    if (options.featuredImageUrl) {
      console.log("Received featuredImageUrl:", options.featuredImageUrl);
    } else {
      console.log("No featuredImageUrl provided in options");
    }

    if (typeof parseDocument !== "function" || typeof generateHTML !== "function") {
      return { statusCode: 500, body: { error: "Server initialization error", details: "Required functions unavailable." } };
    }
    let parsed;
    try {
      parsed = parseDocument(document);
    } catch (parseError) {
      return { statusCode: 400, body: { error: "Failed to parse document", details: parseError instanceof Error ? parseError.message : "Unknown error" } };
    }
    const validationWarnings: string[] = [];
    if (Array.isArray(parsed.metadata?.warnings) && parsed.metadata.warnings.length > 0) {
      validationWarnings.push(...parsed.metadata.warnings);
    }
    if (Array.isArray(parsed.metadata?.missingRequired) && parsed.metadata.missingRequired.length > 0) {
      validationWarnings.push(...parsed.metadata.missingRequired.map((s: string) => `Missing required section: ${s}`));
    }
    if (parsed.images.length > 0 && (!options.imageUrls || Object.keys(options.imageUrls).length === 0)) {
      return { statusCode: 202, body: { success: false, requiresImageUpload: true, images: parsed.images.map((img) => ({ keyword: img.keyword, sectionId: img.sectionId })), message: "Document contains images. Please upload images to Shopify first." } };
    }
    let html: string;
    try {
      html = format === "document" ? generateHTMLDocument(parsed, options) : generateHTML(parsed, options);
      if (!html || html.trim().length === 0) {
        return { statusCode: 500, body: { error: "HTML generation failed", details: "Generated HTML is empty.", metadata: parsed.metadata } };
      }
    } catch (generateError) {
      return { statusCode: 500, body: { error: "Failed to generate HTML", details: generateError instanceof Error ? generateError.message : "Unknown error" } };
    }
    return {
      statusCode: 200,
      body: {
        success: true,
        html,
        metadata: parsed.metadata,
        images: parsed.images,
        sections: parsed.sections.map((s) => ({ id: s.id, name: s.name, wordCount: s.wordCount, valid: s.valid, warnings: s.warnings, images: s.images })),
        hasValidationWarnings: validationWarnings.length > 0,
        validationWarnings,
      },
    };
  } catch (error) {
    console.error("Unexpected error in handleGenerateHTML:", error);
    return { statusCode: 500, body: { error: "Unexpected server error", details: error instanceof Error ? error.message : String(error) } };
  }
}

export const handleGenerateHTML: RequestHandler = (req, res) => {
  generateHTMLAction(req.body).then((r) => res.status(r.statusCode).json(r.body));
};
