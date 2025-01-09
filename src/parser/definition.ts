import type { ParserState, ParserObject } from "../types";
import { consumeWhitespacesAndComments, createParserObject } from "./_common";
import {
  advance,
  createErrorObjectAndAdvanceToNextLine,
  peek,
} from "./_control-flow";
import { parseTerm } from "./term";

// TODO Check with preston if optional period is correct

/**
 * Children are as follows:
 * - term
 * - definition separator
 * - term
 * - perdiod (optional)
 */
export function parseDefinition(
  state: ParserState
): [ParserObject | null, ParserState] {
  const [termResult1, termState1] = parseTerm(state);
  if (!termResult1) return [null, state];

  const children: ParserObject[] = [termResult1];
  let currentState = termState1;

  // Consume whitespaces and comments after term
  const [whitespaceObjects1, stateAfterWhitespace1] =
    consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects1);
  currentState = stateAfterWhitespace1;

  // Parse rule neck or return
  const ruleNeck = peek(currentState);
  if (ruleNeck?.type !== "DEFINITION_SEPARATOR") {
    // TODO In the spec, Preston mentioned "rule separator" instead
    return [null, state];
  }
  children.push(ruleNeck);
  currentState = advance(currentState)[1];

  // Consume whitespaces and comments after neck
  const [whitespaceObjects2, stateAfterWhitespace2] =
    consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects2);
  currentState = stateAfterWhitespace2;

  const [termResult2, termState2] = parseTerm(currentState);

  if (!termResult2) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
      currentState,
      "A definition separator must be followed by a term, got instead:" +
        (peek(currentState)?.type || "EOF")
    );
    children.push(errorObject);
    currentState = errorState;

    return [
      createParserObject("ERROR", children, "Invalid operation structure"),
      currentState,
    ];
  }

  children.push(termResult2);
  currentState = termState2;

  // Consume whitespaces and comments after neck
  const [whitespaceObjects3, stateAfterWhitespace3] =
    consumeWhitespacesAndComments(currentState);

  // Check for optional period
  const period = peek(stateAfterWhitespace3);
  if (period?.type === "PERIOD") {
    // Only if there is a period, add the whitespace objects between it and the last term
    children.push(...whitespaceObjects3);
    currentState = stateAfterWhitespace3;

    children.push(period);
    currentState = advance(currentState)[1];
  }

  return [createParserObject("DEFINITION", children), currentState];
}
