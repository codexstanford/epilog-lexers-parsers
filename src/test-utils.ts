import { expect } from "bun:test";
import type { DatasetToken } from "./dataset-lexer";
import type { RulesetToken } from "./ruleset-lexer";

export function validateTokenBoundaries(
  input: string,
  tokens: (DatasetToken | RulesetToken)[]
) {
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
