import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";

export async function demoAction(): Promise<{ statusCode: number; body: DemoResponse }> {
  return { statusCode: 200, body: { message: "Hello from Express server" } };
}

export const handleDemo: RequestHandler = (_req, res) => {
  demoAction().then((r) => res.status(r.statusCode).json(r.body));
};
