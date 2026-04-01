import { RequestHandler } from "express";

export type ActionResult = { statusCode: number; body: object };

export async function verifyPasswordAction(body: unknown): Promise<ActionResult> {
  if (!body || typeof body !== "object") {
    return { statusCode: 400, body: { error: "Invalid request body" } };
  }
  const { password } = body as { password?: string };
  if (!password) {
    return { statusCode: 400, body: { error: "Password is required" } };
  }
  const correctPassword = process.env.APP_PASSWORD || "AmiySEO";
  if (password === correctPassword) {
    return { statusCode: 200, body: { success: true } };
  }
  return { statusCode: 401, body: { error: "Invalid password" } };
}

export const handleVerifyPassword: RequestHandler = (req, res) => {
  verifyPasswordAction(req.body).then((r) => res.status(r.statusCode).json(r.body));
};
