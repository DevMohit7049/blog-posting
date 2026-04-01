import { RequestHandler } from "express";
import { parseDocument } from "../services/document-parser.js";

export interface ParseDocumentRequest {
  document: string;
}

export type ActionResult = { statusCode: number; body: object };

export async function parseDocumentAction(body: unknown): Promise<ActionResult> {
  try {
    const b = body as ParseDocumentRequest | undefined;
    if (!b || !b.document) {
      return { statusCode: 400, body: { error: "Missing 'document' field in request body", details: "Document must be a non-empty string" } };
    }
    try {
      const parsed = parseDocument(b.document);
      return { statusCode: 200, body: { success: true, data: parsed } };
    } catch (parseError) {
      console.error("Error parsing document:", parseError);
      return { statusCode: 500, body: { error: "Failed to parse document", details: parseError instanceof Error ? parseError.message : String(parseError) } };
    }
  } catch (error) {
    console.error("Unexpected error in handleParseDocument:", error);
    return { statusCode: 500, body: { error: "Failed to parse document", details: error instanceof Error ? error.message : String(error) } };
  }
}

export const handleParseDocument: RequestHandler = (req, res) => {
  parseDocumentAction(req.body).then((r) => res.status(r.statusCode).json(r.body));
};
