import { peek, advance } from "./_control-flow";
import type { ParserState, RulesetParserObject } from "../types";
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
  // Try parsing constant term
  const [constantResult, constantState] = parseConstantTerm(state);
  if (constantResult) return [constantResult, constantState];

  // Try parsing list term
  const [listResult, listState] = parseListTerm(state);
  if (listResult) return [listResult, listState];

  // TODO: Add compound term parsing later
  
  return [null, state];
}
