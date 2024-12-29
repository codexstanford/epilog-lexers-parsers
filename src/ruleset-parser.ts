import type { RulesetToken } from "./ruleset-lexer";

export type RulesetParserResult = {
  // Parser result type definitions will go here
};

export function rulesetParser(
  tokens: RulesetToken[]
): RulesetParserResult | "error" {
  throw new Error("Not implemented");
}
