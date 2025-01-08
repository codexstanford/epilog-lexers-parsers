import { peek, advance } from "./_control-flow";
import type { ParserState, RulesetParserObject } from "../types";
import { createParserObject } from "./_common";

/**
 * Child is one of the following:
 * - variable-named
 * - variable-anonymous
 * @param state
 */
export function parseVariable(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const token = peek(state);

  if (!token || !["VARIABLE_ANONYMOUS", "VARIABLE_NAMED"].includes(token.type))
    return [null, state];

  const [_, newState] = advance(state);

  return [createParserObject("VARIABLE", [token]), newState];
}
