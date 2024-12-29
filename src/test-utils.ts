import { expect } from "bun:test";
import type { RulesetToken } from "./types";

export function validateTokenBoundaries(input: string, tokens: RulesetToken[]) {
  const totalTokenLength = tokens.reduce((sum, token) => {
    return sum + (token.end - token.start);
  }, 0);
  expect(totalTokenLength).toBe(input.length);

  for (let i = 0; i < tokens.length - 1; i++) {
    const current = tokens[i];
    const next = tokens[i + 1];
    expect(current.end).toBeLessThanOrEqual(next.start);
  }

  tokens.forEach((token) => {
    expect(token.content.length).toBe(token.end - token.start);
    expect(input.substring(token.start, token.end)).toBe(token.content);
  });
}
