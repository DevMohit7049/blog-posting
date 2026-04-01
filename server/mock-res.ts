/**
 * Creates a mock Express-like response that resolves a promise with { statusCode, body }.
 * Used when running Express handlers from the Netlify native function (no real res).
 * Supports both res.status(200).json(body) and res.json(body) patterns.
 */
export type ActionResult = { statusCode: number; body: object };

export function createMockRes(
  resolve: (result: ActionResult) => void,
  reject: (err: unknown) => void
): Record<string, unknown> {
  return {
    status: (code: number) => ({
      json: (b: object) => resolve({ statusCode: code, body: b }),
    }),
    json: (b: object) => resolve({ statusCode: 200, body: b }),
    setHeader: () => {},
  };
}
