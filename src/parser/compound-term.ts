import type { ParserState, RulesetParserObject } from "../types";
import {
  createParserObject,
  getLastNonWhitespaceOrCommentObject,
  isWhitespaceOrComment,
} from "./_common";
import {
  advance,
  createErrorObjectAndAdvanceToNextLine,
  peek,
} from "./_control-flow";
import { parseTerm } from "./term";

/**
 * Children are as follows:
 * - constant term
 * - open paren
 * - one or more comma-separated terms, i.e.
 *   - term
 *   - Kleene star
 *     - comma
 *     - term
 * - close paren
 *
 * @param state
 */
export function parseCompoundTerm(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const identifier = peek(state);
  if (!identifier || identifier.type !== "CONSTANT") return [null, state];

  const children: RulesetParserObject[] = [identifier];
  let currentState = advance(state)[1];
  let hasError = false;

  // Check for opening parenthesis
  const openParen = peek(currentState);
  if (!openParen || openParen.type !== "OPEN_PAREN") {
    // Make sure to return original state if no opening parenthesis
    // i.e., not currentState where we've already advanced
    return [null, state];
  }

  children.push(openParen);
  currentState = advance(currentState)[1];

  // Parse terms and commas
  while (true) {
    const token = peek(currentState);

    if (!token) {
      hasError = true;
      const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
        currentState,
        "Expected closing parenthesis, but found end of input"
      );
      children.push(errorObject);
      currentState = errorState;
      break;
    }

    if (isWhitespaceOrComment(token)) {
      children.push(token);
      currentState = advance(currentState)[1];
      continue;
    }

    if (token.type === "CLOSE_PAREN") {
      const lastNonWhitespace = getLastNonWhitespaceOrCommentObject(children);

      if (lastNonWhitespace?.type === "COMMA") {
        hasError = true;
        const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
          currentState,
          "Expected term, but found closing parenthesis"
        );
        children.push(errorObject);
        currentState = errorState;
        break;
      }

      children.push(token);
      currentState = advance(currentState)[1];
      break;
    }

    const [success, newState] = parseCompoundTermElement(
      currentState,
      children
    );

    currentState = newState;

    if (!success) {
      hasError = true;
      break;
    }
  }

  return [
    createParserObject(
      "COMPOUND_TERM",
      children,
      hasError ? "Invalid compound term structure" : undefined
    ),
    currentState,
  ];
}

function parseCompoundTermElement(
  state: ParserState,
  children: RulesetParserObject[]
): [boolean, ParserState] {
  const lastNonWhitespace = getLastNonWhitespaceOrCommentObject(children);

  if (!lastNonWhitespace)
    throw Error("Expected at least constant and opening parenthesis");

  const isExpectingTerm =
    lastNonWhitespace.type === "OPEN_PAREN" ||
    lastNonWhitespace.type === "COMMA";

  if (isExpectingTerm) {
    return parseTermElement(state, children);
  }

  return parseCommaElement(state, children);
}

function parseTermElement(
  state: ParserState,
  children: RulesetParserObject[]
): [boolean, ParserState] {
  const [termObject, newState] = parseTerm(state);

  if (!termObject) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
      state,
      `Expected term, but found ${peek(state)?.type}`
    );
    children.push(errorObject);
    return [false, errorState];
  }

  children.push(termObject);
  return [true, newState];
}

function parseCommaElement(
  state: ParserState,
  children: RulesetParserObject[]
): [boolean, ParserState] {
  const token = peek(state);

  if (token?.type !== "COMMA") {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
      state,
      `Expected comma, but found ${token?.type}`
    );
    children.push(errorObject);
    return [false, errorState];
  }

  children.push(token);
  return [true, advance(state)[1]];
}
