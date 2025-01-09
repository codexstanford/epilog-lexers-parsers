import { expect } from "bun:test";
import type { RulesetParserObject, RulesetToken } from "./types";

export function validateTokenBoundaries(input: string, tokens: RulesetToken[]) {
  // Sum of all tokens (end - start) should be equal to the input length

  const totalTokenLength = tokens.reduce((sum, token) => {
    return sum + (token.end - token.start);
  }, 0);

  expect(totalTokenLength).toBe(input.length);

  // Tokens should not overlap

  for (let i = 0; i < tokens.length - 1; i++) {
    const current = tokens[i];
    const next = tokens[i + 1];

    if (current.line === next.line) expect(current.end).toEqual(next.start);
    else expect(next.start).toEqual(0);
  }

  // Token content should match the input

  tokens.forEach((token) => {
    expect(token.content.length).toBe(token.end - token.start);
  });
}

export function findErrors(obj: RulesetParserObject): RulesetParserObject[] {
  const errors: RulesetParserObject[] = [];

  if (obj.type === "ERROR") {
    errors.unshift(obj);
    return errors;
  }

  if (obj.children) {
    for (const child of obj.children) {
      errors.unshift(...findErrors(child));
    }
  }

  return errors;
}
