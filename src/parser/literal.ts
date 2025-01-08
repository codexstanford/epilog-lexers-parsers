import type { ParserState, RulesetParserObject } from "../types";
import { createParserObject } from "./_common";
import { advance, peek } from "./_control-flow";
import { parseAtom } from "./atom";

/**
 * Children are as follows:
 * - (optional) negation symbol
 * - atom
 * @param state
 */
export function parseLiteral(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const nextToken = peek(state);
  let currentState = state;
  const children: RulesetParserObject[] = [];

  // Check for optional negation symbol
  if (nextToken && nextToken.type === "NEGATION_SYMBOL") {
    children.push(nextToken);
    currentState = advance(currentState)[1];
  }

  // Parse the atom
  const [atomResult, atomState] = parseAtom(currentState);
  if (!atomResult) {
    if (nextToken && nextToken.type === "NEGATION_SYMBOL") {
      return [
        createParserObject(
          "ERROR",
          children,
          `Negaion symbol must be followed by an atom. Found instead: ${
            peek(currentState)?.content
          }`
        ),
        currentState,
      ];
    }

    return [null, state];
  }

  children.push(atomResult);
  return [createParserObject("LITERAL", children), atomState];
}
