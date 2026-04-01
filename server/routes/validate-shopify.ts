import { RequestHandler } from "express";
import { getShopifyClient } from "../services/shopify-client.js";

export type ActionResult = { statusCode: number; body: object };

export async function validateShopifyAction(): Promise<ActionResult> {
  try {
    const shopifyClient = getShopifyClient();
    let isConnected = false;
    let connectionError: Error | null = null;
    try {
      isConnected = await shopifyClient.validateConnection();
    } catch (err) {
      connectionError = err instanceof Error ? err : new Error(String(err));
    }
    if (!isConnected) {
      const errorDetails = connectionError?.message || "Shopify credentials are not properly configured.";
      return { statusCode: 503, body: { success: false, isConnected: false, error: "Cannot connect to Shopify", details: errorDetails, suggestion: "Please verify that SHOPIFY_SHOP and SHOPIFY_ADMIN_ACCESS_TOKEN are correctly set and that your Shopify API access token is still valid." } };
    }
    try {
      const blogId = await shopifyClient.getBlogId();
      return { statusCode: 200, body: { success: true, isConnected: true, message: "Shopify is properly configured", blogId } };
    } catch (blogError) {
      const blogErrorMessage = blogError instanceof Error ? blogError.message : "Cannot retrieve blog information";
      const blogIdFromEnv = process.env.BLOG_ID;
      if (blogIdFromEnv) {
        return { statusCode: 200, body: { success: true, isConnected: true, message: "Shopify is properly configured (using BLOG_ID from environment)", blogId: blogIdFromEnv } };
      }
      return { statusCode: 400, body: { success: false, isConnected: true, error: "Shopify is connected but no blog found", details: blogErrorMessage, suggestion: "Please ensure your Shopify store has at least one blog and that your access token has blog permissions. Alternatively, you can set the BLOG_ID environment variable directly." } };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("not configured")) {
      return { statusCode: 503, body: { success: false, isConnected: false, error: "Shopify is not configured", details: "Missing Shopify credentials", suggestion: "Please set SHOPIFY_SHOP and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables." } };
    }
    return { statusCode: 500, body: { success: false, isConnected: false, error: "Failed to validate Shopify connection", details: errorMessage } };
  }
}

export const handleValidateShopify: RequestHandler = async (_req, res) => {
  validateShopifyAction().then((r) => res.status(r.statusCode).json(r.body));
};
