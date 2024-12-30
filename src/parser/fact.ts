import { peek, advance } from "./_control-flow";
import type { ParserState, RulesetParserObject } from "../types";
import { parseCompoundTerm } from "./compound-term";
import { consumeWhitespaces } from "./_common";

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
    children.push(compoundResult);
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

  const [whitespaces, newState] = consumeWhitespaces(currentState);
  children.push(...whitespaces);
  currentState = newState;

  // Parse optional punctuation period

  const nextToken = peek(currentState);

  if (nextToken?.type === "PERIOD") {
    children.push(nextToken);
    currentState = advance(currentState)[1];
  }

  return [
    {
      type: "FACT",
      start: children[0].start,
      end: children[children.length - 1].end,
      line: children[0].line,
      content: children.map((child) => child.content).join(""),
      children,
    },
    currentState,
  ];
}
