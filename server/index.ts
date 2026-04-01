import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";
import multer from "multer";

// Load environment variables from .env file.
// In some bundled environments (like Netlify Functions), import.meta.url may
// not be defined as expected, so fall back to process.cwd().
let envPath: string | undefined;
const envResult = (() => {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    envPath = path.resolve(__dirname, "../.env");
    return dotenv.config({ path: envPath });
  } catch {
    envPath = path.resolve(process.cwd(), ".env");
    return dotenv.config();
  }
})();

console.log("Dotenv loading:", {
  path: envPath,
  parsed: envResult.parsed ? Object.keys(envResult.parsed) : [],
  error: envResult.error?.message,
});

// Ensure all parsed variables are available in process.env
if (envResult.parsed) {
  for (const [key, value] of Object.entries(envResult.parsed)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

console.log("Environment variables available:", {
  SHOPIFY_SHOP: process.env.SHOPIFY_SHOP || "NOT SET",
  SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? "***set***" : "NOT SET",
  SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || "NOT SET",
  BLOG_ID: process.env.BLOG_ID || "NOT SET",
  APP_PASSWORD: process.env.APP_PASSWORD ? "***set***" : "NOT SET",
});
import { handleDemo } from "./routes/demo.js";
import { handleParseDocument } from "./routes/parse-document.js";
import { handleGenerateHTML } from "./routes/generate-html.js";
import { handlePublishShopify } from "./routes/publish-shopify.js";
import { handleUploadImage } from "./routes/upload-image.js";
import { handleVerifyPassword } from "./routes/verify-password.js";
import { handleGetProducts } from "./routes/get-products.js";
import { handleValidateShopify } from "./routes/validate-shopify.js";
import { handleDiagnoseShopify } from "./routes/diagnose-shopify.js";

// Configure multer for file uploads (keep in memory for simplicity)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."));
    }
  },
});

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  // Workaround for serverless-http + Express 5: body arrives as a Buffer and socket is not
  // readable, so express.json() never runs. Force readable so body-parser runs (see
  // https://github.com/dougmoscrop/serverless-http/issues/274).
  app.use((req, _res, next) => {
    if (req.socket && !req.socket.readable && req.body && Buffer.isBuffer(req.body)) {
      (req.socket as { readable?: boolean }).readable = true;
    }
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Authentication routes
  app.post("/api/verify-password", handleVerifyPassword);

  app.get("/api/demo", handleDemo);

  // Blog generator routes
  app.post("/api/parse-document", handleParseDocument);
  app.post("/api/generate-html", handleGenerateHTML);
  app.post("/api/publish-shopify", handlePublishShopify);
  app.get("/api/products", handleGetProducts);
  app.get("/api/validate-shopify", handleValidateShopify);
  app.get("/api/diagnose-shopify", handleDiagnoseShopify);

  // Image upload route
  app.post("/api/upload-image", upload.single("file"), handleUploadImage);

  // Debug endpoint to check environment variables
  app.get("/api/env-check", (_req, res) => {
    res.json({
      SHOPIFY_SHOP: process.env.SHOPIFY_SHOP || "NOT SET",
      SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? "***SET***" : "NOT SET",
      SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || "NOT SET",
      BLOG_ID: process.env.BLOG_ID || "NOT SET",
      APP_PASSWORD: process.env.APP_PASSWORD ? "***SET***" : "NOT SET",
    });
  });

  // Error handling middleware - must be last
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", err);

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(status).json({
      success: false,
      error: message,
      details: process.env.NODE_ENV === "production" ? undefined : err.stack,
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  return app;
}
