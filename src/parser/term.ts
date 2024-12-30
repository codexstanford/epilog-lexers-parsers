import type { ParserState, RulesetParserObject } from "../types";
import { parseCompoundTerm } from "./compound-term";
import { parseConstantTerm } from "./constant-term";
import { parseListTerm } from "./list-term";

/**
 * Child is one of the following:
 * - constant term
 * - compound term
 * - list term
 * @param state
 */
export function parseTerm(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  // Try parsing compound term
  const [compoundResult, compoundState] = parseCompoundTerm(state);
  if (compoundResult) return [compoundResult, compoundState];

  // Try parsing list term
  const [listResult, listState] = parseListTerm(state);
  if (listResult) return [listResult, listState];

  // Try parsing constant term
  const [constantResult, constantState] = parseConstantTerm(state);
  if (constantResult) return [constantResult, constantState];

  return [null, state];
}
