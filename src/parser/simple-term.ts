import { peek, advance } from "./_control-flow";
import type { ParserState, ParserObject } from "../types";

/**
 * Child is one of the following:
 * - constant
 * - number
 * - string
 * @param state
 */
export function parseSimpleTerm(
  state: ParserState
): [ParserObject | null, ParserState] {
  const token = peek(state);

  if (!token || !["SYMBOL_TERM", "NUMBER", "STRING"].includes(token.type))
    return [null, state];

  const [_, newState] = advance(state);

  return [
    {
      ...token,
      type: "SIMPLE_TERM",
      children: [token],
    },
    newState,
  ];
}
