import type { RulesetParserObject } from "../types";

export function getLastNonWhitespaceObject(
  tokens: RulesetParserObject[]
): RulesetParserObject | null {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].type !== "WHITESPACE") return tokens[i];
  }
  return null;
}
