import type { ParserState, RulesetParserObject } from "../types";
import { createParserObject } from "./_common";
import { advance, peek } from "./_control-flow";
import { parseCompoundTerm } from "./compound-term";

/**
 * Children are as follows:
 * - symbol term
 * - (optional)
 *   - open paren
 *   - (optional)
 *     - one or more comma-separated terms
 *   - close paren
 * @param state
 */
export function parseAtom(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  // Try parsing compound term
  const [compoundResult, compoundState] = parseCompoundTerm(state);
  if (compoundResult && compoundResult.children) {
    return [createParserObject("ATOM", compoundResult.children), compoundState];
  }

  const nextToken = peek(state);

  if (!nextToken || nextToken.type !== "SYMBOL_TERM") {
    return [null, state];
  }

  return [createParserObject("ATOM", [nextToken]), advance(state)[1]];
}
