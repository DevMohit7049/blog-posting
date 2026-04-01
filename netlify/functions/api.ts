/**
 * Native Netlify function: no Express, no serverless-http.
 * Routes by path + method and calls shared actions from server/routes.
 */
import Busboy from "busboy";
import { Readable } from "stream";

type HandlerEvent = {
  path: string;
  httpMethod: string;
  body: string | null;
  isBase64Encoded?: boolean;
  queryStringParameters?: Record<string, string | undefined> | null;
  headers?: Record<string, string | undefined>;
};
type HandlerResponse = { statusCode: number; headers: Record<string, string>; body: string };
type Handler = (event: HandlerEvent) => Promise<HandlerResponse>;
import { verifyPasswordAction } from "../../server/routes/verify-password.js";
import { demoAction } from "../../server/routes/demo.js";
import { parseDocumentAction } from "../../server/routes/parse-document.js";
import { generateHTMLAction } from "../../server/routes/generate-html.js";
import { publishShopifyAction } from "../../server/routes/publish-shopify.js";
import { getProductsAction } from "../../server/routes/get-products.js";
import { validateShopifyAction } from "../../server/routes/validate-shopify.js";
import { diagnoseShopifyAction } from "../../server/routes/diagnose-shopify.js";
import { uploadImageAction } from "../../server/routes/upload-image.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

function jsonBody(event: HandlerEvent): unknown {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function queryFromEvent(event: HandlerEvent): Record<string, string | undefined> {
  const q = event.queryStringParameters;
  if (!q) return {};
  return Object.fromEntries(Object.entries(q).map(([k, v]) => [k, v ?? undefined]));
}

/** Path after /api/ e.g. "verify-password" or "products" */
function apiPath(event: HandlerEvent): string {
  const path = event.path ?? "";
  const m = path.match(/\/api\/(.*)$/) || path.match(/\/functions\/api\/(.*)$/);
  return (m ? m[1] : path.replace(/^.*\//, "")).replace(/\/$/, "") || "";
}

function send(statusCode: number, body: object): HandlerResponse {
  return { statusCode, headers: CORS, body: JSON.stringify(body) };
}

async function parseMultipart(event: HandlerEvent): Promise<{ file: { buffer: Buffer; mimetype: string; originalname: string } | null; keyword: string }> {
  const raw = event.body
    ? event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : Buffer.from(event.body, "utf8")
    : Buffer.alloc(0);
  const contentType = event.headers?.["content-type"] || event.headers?.["Content-Type"] || "";
  return new Promise((resolve, reject) => {
    let file: { buffer: Buffer; mimetype: string; originalname: string } | null = null;
    let keyword = "image";
    const bb = Busboy({ headers: { "content-type": contentType } });
    bb.on("file", (_name: string, stream: NodeJS.ReadableStream, info: { mimeType: string; filename?: string }) => {
      const chunks: Buffer[] = [];
      stream.on("data", (d: Buffer) => chunks.push(d));
      stream.on("end", () => {
        file = { buffer: Buffer.concat(chunks), mimetype: info.mimeType || "application/octet-stream", originalname: info.filename || "image" };
      });
    });
    bb.on("field", (name: string, value: string) => {
      if (name === "keyword") keyword = value;
    });
    bb.on("finish", () => resolve({ file, keyword }));
    bb.on("error", reject);
    Readable.from(raw).pipe(bb as any);
  });
}

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  const path = apiPath(event);
  const method = event.httpMethod || "GET";

  try {
    // GET
    if (method === "GET") {
      if (path === "ping") return send(200, { message: process.env.PING_MESSAGE ?? "ping" });
      if (path === "demo") {
        const r = await demoAction();
        return send(r.statusCode, r.body as object);
      }
      if (path === "products") {
        const q = queryFromEvent(event);
        const r = await getProductsAction(q);
        return send(r.statusCode, r.body as object);
      }
      if (path === "validate-shopify") {
        const r = await validateShopifyAction();
        return send(r.statusCode, r.body as object);
      }
      if (path === "diagnose-shopify") {
        const r = await diagnoseShopifyAction();
        return send(r.statusCode, r.body as object);
      }
      if (path === "env-check") {
        return send(200, {
          SHOPIFY_SHOP: process.env.SHOPIFY_SHOP || "NOT SET",
          SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? "***SET***" : "NOT SET",
          SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || "NOT SET",
          BLOG_ID: process.env.BLOG_ID || "NOT SET",
          APP_PASSWORD: process.env.APP_PASSWORD ? "***SET***" : "NOT SET",
        });
      }
    }

    // POST
    if (method === "POST") {
      if (path === "verify-password") {
        const r = await verifyPasswordAction(jsonBody(event));
        return send(r.statusCode, r.body as object);
      }
      if (path === "parse-document") {
        const r = await parseDocumentAction(jsonBody(event));
        return send(r.statusCode, r.body as object);
      }
      if (path === "generate-html") {
        const r = await generateHTMLAction(jsonBody(event));
        return send(r.statusCode, r.body as object);
      }
      if (path === "publish-shopify") {
        const r = await publishShopifyAction(jsonBody(event));
        return send(r.statusCode, r.body as object);
      }
      if (path === "upload-image") {
        let file: { buffer: Buffer; mimetype: string; originalname: string } | null = null;
        let keyword = "image";
        try {
          const parsed = await parseMultipart(event);
          file = parsed.file;
          keyword = parsed.keyword;
        } catch (_) {
          return send(400, { success: false, error: "Failed to parse multipart body." });
        }
        const r = await uploadImageAction(file, keyword);
        return send(r.statusCode, r.body as object);
      }
    }

    return send(404, { error: "Not found", path, method });
  } catch (err) {
    console.error("API error:", err);
    return send(500, { error: "Internal server error", details: err instanceof Error ? err.message : String(err) });
  }
};
