import { peek, advance } from "./_control-flow";
import type { ParserState, RulesetParserObject } from "../types";

/**
 * Child is one of the following:
 * - constant
 * - number
 * - string
 * @param state
 */
export function parseConstantTerm(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const token = peek(state);

  if (!token || !["CONSTANT", "NUMBER", "STRING"].includes(token.type))
    return [null, state];

  const [_, newState] = advance(state);

  return [
    {
      ...token,
      type: "CONSTANT_TERM",
      children: [token],
    },
    newState,
  ];
}
