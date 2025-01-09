import type { ParserState, ParserObject } from "../types";
import { consumeWhitespacesAndComments, createParserObject } from "./_common";
import { advance, peek } from "./_control-flow";
import { parseAtom } from "./atom";
import { parseOneOrMoreAmpersandSeparatedLiterals } from "./rule";

/**
 * Children are as follows:
 * - atom
 * - double-colon
 * - (optional)
 *   - one or more ampersand-separated literals
 *   - double-arrow
 * - one or more ampersand-separated literals
 * - (optional) punctuation period
 */
export function parseOperation(
  state: ParserState
): [ParserObject | null, ParserState] {
  const [atomResult, atomState] = parseAtom(state);
  if (!atomResult) return [null, state];

  const children: ParserObject[] = [atomResult];
  let currentState = atomState;
  let hasError = false;

  // Consume whitespaces and comments after atom
  const [whitespaceObjects1, stateAfterWhitespace1] =
    consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects1);
  currentState = stateAfterWhitespace1;

  // Parse double-colon or return
  const doubleColon = peek(currentState);
  if (doubleColon?.type !== "DOUBLE_COLON") {
    return [null, state];
  }
  children.push(doubleColon);
  currentState = advance(currentState)[1];

  // Parse optional preconditions and double-arrow
  const [whitespaceObjects2, stateAfterWhitespace2] =
    consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects2);
  currentState = stateAfterWhitespace2;

  const [literalsResult, newState, literalsHasError] =
    parseOneOrMoreAmpersandSeparatedLiterals(currentState);
  children.push(...literalsResult);
  currentState = newState;
  hasError = hasError || literalsHasError;

  // Check if there is a double-arrow
  const possibleDoubleArrow = peek(currentState);
  if (possibleDoubleArrow?.type === "DOUBLE_ARROW") {
    children.push(possibleDoubleArrow);
    currentState = advance(currentState)[1];

    // Parse postconditions (required)
    const [literalsResult, newState, literalsHasError] =
      parseOneOrMoreAmpersandSeparatedLiterals(currentState);
    children.push(...literalsResult);
    currentState = newState;
    hasError = hasError || literalsHasError;
  }

  // Check for optional period
  const period = peek(currentState);
  if (period?.type === "PERIOD") {
    children.push(period);
    currentState = advance(currentState)[1];
  }

  return [
    createParserObject(
      "OPERATION",
      children,
      hasError ? "Invalid operation structure" : undefined
    ),
    currentState,
  ];
}
