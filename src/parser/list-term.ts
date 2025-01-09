import type { ParserState, RulesetParserObject } from "../types";
import {
  consumeWhitespacesAndComments,
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

/* -------------------------------------------------------------------------- */
/*                                    Main                                    */
/* -------------------------------------------------------------------------- */

/**
 * Child is one of the following:
 * - nil (i.e. what would otherwise be a three-character symbol constant)
 * - bracketed list
 *   - open bracket
 *   - 0 or more comma-separated terms, i.e. one of:
 *     - the empty string
 *     - one or more comma-separated terms
 *   - close bracket
 * - exclamation-separated list, i.e.
 *   - term
 *   - Kleene star
 *     - list separator
 *     - term
 * @param state
 * @param checkExclamationSeparated Needed to prevent endless recursion
 */
export function parseListTerm(
  state: ParserState,
  checkExclamationSeparated = true
): [RulesetParserObject | null, ParserState] {
  // Try parsing nil constant
  const [nilResult, nilState] = parseNilConstant(state);
  if (nilResult) return [nilResult, nilState];

  // Try parsing bracketed list
  const [bracketResult, bracketState] = parseBracketedList(state);
  if (bracketResult) return [bracketResult, bracketState];

  if (checkExclamationSeparated) {
    // Try parsing exclamation-separated list
    const [exclamationResult, exclamationState] =
      parseExclamationSeparatedList(state);
    if (exclamationResult) return [exclamationResult, exclamationState];
  }

  return [null, state];
}

/* -------------------------------------------------------------------------- */
/*                                     Nil                                    */
/* -------------------------------------------------------------------------- */

function parseNilConstant(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const token = peek(state);
  if (!token || token.type !== "SYMBOL_TERM" || token.content !== "nil") {
    return [null, state];
  }

  const [_, currentState] = advance(state);

  return [
    createParserObject("LIST_TERM", [createParserObject("NIL", [token])]),
    currentState,
  ];
}

/* -------------------------------------------------------------------------- */
/*                               Bracketed List                               */
/* -------------------------------------------------------------------------- */

function parseBracketedList(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const firstToken = peek(state);
  if (!firstToken || firstToken.type !== "OPEN_BRACKET") {
    return [null, state];
  }

  const children: RulesetParserObject[] = [firstToken];
  let currentState = advance(state)[1];
  let hasError = false;

  while (true) {
    const token = peek(currentState);

    if (!token) {
      hasError = true;
      const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
        currentState,
        "Expected closing bracket, but found end of input"
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

    if (token.type === "CLOSE_BRACKET") {
      // A close bracket is not allowed directly after a comma
      const lastNonWhitespace = getLastNonWhitespaceOrCommentObject(children);
      if (lastNonWhitespace?.type === "COMMA") {
        hasError = true;
        const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
          currentState,
          "Expected term, but found closing bracket"
        );
        children.push(errorObject);
        currentState = errorState;
        break;
      }

      children.push(token);
      currentState = advance(currentState)[1];
      break;
    }

    const [success, newState] = parseBracketedListElement(
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
      "LIST_TERM",
      children,
      hasError ? "Invalid LIST_TERM" : undefined
    ),
    currentState,
  ];
}

function parseBracketedListElement(
  state: ParserState,
  children: RulesetParserObject[]
): [boolean, ParserState] {
  const lastNonWhitespace = getLastNonWhitespaceOrCommentObject(children);
  if (!lastNonWhitespace) throw Error("Expected at least opening bracket");

  const isExpectingTerm =
    lastNonWhitespace.type === "OPEN_BRACKET" ||
    lastNonWhitespace.type === "COMMA";

  if (isExpectingTerm) {
    return parseTermElement(state, children);
  }

  return parseCommaElement(state, children);
}

function parseTermElement(
  state: ParserState,
  children: RulesetParserObject[],
  checkExclamationSeparated?: boolean
): [boolean, ParserState] {
  const [termObject, newState] = parseTerm(state, checkExclamationSeparated);

  if (!termObject) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
      newState,
      `Expected term, but found ${peek(newState)?.type}`
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

/* -------------------------------------------------------------------------- */
/*                         Exclamation-Separated List                         */
/* -------------------------------------------------------------------------- */

function parseExclamationSeparatedList(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const [firstTerm, afterFirstTerm] = parseTerm(state, false);
  if (!firstTerm) return [null, state];

  const children: RulesetParserObject[] = [firstTerm];
  let currentState = afterFirstTerm;
  let hasError = false;
  let isExpectingTerm = true;

  // Consume whitespaces and comments before potential exclamation mark
  const [whitespaceObjects, stateAfterWhitespace] =
    consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects);
  currentState = stateAfterWhitespace;

  const potentialListSeparator = peek(currentState);

  if (potentialListSeparator?.type !== "LIST_SEPARATOR") return [null, state];

  children.push(potentialListSeparator);
  currentState = advance(currentState)[1];

  while (true) {
    const token = peek(currentState);

    if (token && isWhitespaceOrComment(token)) {
      children.push(token);
      currentState = advance(currentState)[1];
      continue;
    }

    if (isExpectingTerm) {
      const [success, newState] = parseTermElement(
        currentState,
        children,
        false
      );
      currentState = newState;
      if (!success) {
        hasError = true;
        break;
      }
      isExpectingTerm = false;
      continue;
    }

    if (token?.type === "LIST_SEPARATOR") {
      children.push(token);
      currentState = advance(currentState)[1];
      isExpectingTerm = true;
      continue;
    }

    break;
  }

  return [
    createParserObject(
      "LIST_TERM",
      children,
      hasError ? "Invalid LIST_TERM" : undefined
    ),
    currentState,
  ];
}
