import { RequestHandler } from "express";
import { getShopifyClient } from "../services/shopify-client.js";

export type ActionResult = { statusCode: number; body: object };

export async function getProductsAction(query: Record<string, string | undefined>): Promise<ActionResult> {
  try {
    const limit = parseInt(query?.limit as string) || 250;
    console.log(`Fetching products with limit: ${limit}`);

    let shopifyClient;
    try {
      shopifyClient = getShopifyClient();
    } catch {
      return { statusCode: 503, body: { success: false, error: "Shopify not configured", details: "SHOPIFY_SHOP and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables are required.", code: "SHOPIFY_NOT_CONFIGURED" } };
    }
    let isConnected = false;
    try {
      isConnected = await shopifyClient.validateConnection();
    } catch {
      /* continue */
    }
    let products = await shopifyClient.getProducts(limit);
    if (!Array.isArray(products)) products = [];
    const validProducts = products.filter((p: any) => p && typeof p === "object" && p.id && p.title && p.handle);
    return { statusCode: 200, body: { success: true, products: validProducts } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    let code = "PRODUCTS_FETCH_ERROR";
    let userMessage = "Failed to fetch products from Shopify";
    if (/401|Unauthorized|authentication|credentials/i.test(errorMessage)) {
      code = "SHOPIFY_AUTH_ERROR";
      userMessage = "Shopify authentication failed. Invalid or expired access token.";
    } else if (/not configured|SHOPIFY_SHOP|environment variables/i.test(errorMessage)) {
      code = "SHOPIFY_NOT_CONFIGURED";
      userMessage = "Shopify credentials are not configured.";
    } else if (/timeout|AbortError|ECONNREFUSED|temporarily unavailable/i.test(errorMessage)) {
      code = "SHOPIFY_TIMEOUT";
      userMessage = "Shopify server is temporarily unavailable. Please try again later.";
    } else if (/not found|404/i.test(errorMessage)) {
      code = "SHOPIFY_STORE_NOT_FOUND";
      userMessage = "Shopify store could not be found. Check your shop name.";
    }
    return { statusCode: 200, body: { success: false, products: [], error: userMessage, details: errorMessage, code } };
  }
}

const asyncHandler = (fn: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const getProductsHandler: RequestHandler = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const q = (req.query as Record<string, string>) || {};
  getProductsAction(q).then((r) => res.status(r.statusCode).json(r.body));
};

export const handleGetProducts = asyncHandler(getProductsHandler);
