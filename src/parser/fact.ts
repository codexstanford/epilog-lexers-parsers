import type { ParserState, RulesetParserObject } from "../types";
import { createParserObject } from "./_common";
import { advance, peek } from "./_control-flow";
import { parseCompoundTerm } from "./compound-term";

/**
 * Children are as follows:
 * - one of:
 *   - constant
 *   - number
 *   - string
 * - (optional)
 *   - open paren
 *   - (optional)
 *     - one or more comma-separated terms (same as above)
 *   - close paren
 * - (optional) punctuation period
 *
 * @param state
 */
export function parseFact(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const children = [] as RulesetParserObject[];
  let currentState = state;

  // Try parsing compound term
  const [compoundResult, compoundState] = parseCompoundTerm(state);
  if (compoundResult) {
    children.push(...(compoundResult.children || []));
    currentState = compoundState;
  } else {
    const nextToken = peek(currentState);

    if (!nextToken) {
      return [null, currentState];
    }

    if (
      nextToken.type === "CONSTANT" ||
      nextToken.type === "NUMBER" ||
      nextToken.type === "STRING"
    ) {
      children.push(nextToken);
      currentState = advance(currentState)[1];
    }
  }

  if (children.length === 0) {
    return [null, currentState];
  }

  // Consume whitespaces

  /*   const [whitespaces, newState] = consumeWhitespaces(currentState);
  children.push(...whitespaces);
  currentState = newState; */

  // Parse optional punctuation period

  const nextToken = peek(currentState);

  if (nextToken?.type === "PERIOD") {
    children.push(nextToken);
    currentState = advance(currentState)[1];
  }

  return [createParserObject("FACT", children), currentState];
}
