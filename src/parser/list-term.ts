import type { ParserState, RulesetParserObject } from "../types";
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
 */
export function parseListTerm(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  // Try parsing nil constant
  const [nilResult, nilState] = parseNilConstant(state);
  if (nilResult) return [nilResult, nilState];

  // Try parsing bracketed list
  const [bracketResult, bracketState] = parseBracketedList(state);
  if (bracketResult) return [bracketResult, bracketState];

  // TODO: Implement exclamation-separated list parsing
  return [null, state];
}

/* -------------------------------------------------------------------------- */
/*                                     Nil                                    */
/* -------------------------------------------------------------------------- */

function parseNilConstant(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const token = peek(state);
  if (!token || token.type !== "CONSTANT" || token.content !== "nil") {
    return [null, state];
  }

  const [_, currentState] = advance(state);
  return [
    {
      ...token,
      type: "LIST_TERM",
      children: [token],
    },
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

    if (token.type === "WHITESPACE" || token.type === "CLOSE_BRACKET") {
      children.push(token);
      currentState = advance(currentState)[1];
      if (token.type === "CLOSE_BRACKET") break;
      continue;
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
    {
      type: hasError ? "ERROR" : "LIST_TERM",
      start: firstToken.start,
      end: children[children.length - 1].end,
      line: firstToken.line,
      content: children.map((c) => c.content).join(""),
      children,
      ...(hasError && { errorMessage: "Invalid list structure" }),
    },
    currentState,
  ];
}

function parseBracketedListElement(
  state: ParserState,
  children: RulesetParserObject[]
): [boolean, ParserState] {
  const lastNonWhitespace = getLastNonWhitespaceObject(children);
  if (!lastNonWhitespace) throw Error("Expected at least opening bracket");

  const isExpectingTerm =
    lastNonWhitespace.type === "OPEN_BRACKET" ||
    lastNonWhitespace.type === "COMMA";

  if (isExpectingTerm) {
    return parseTermElement(state, children);
  }

  return parseCommaElement(state, children);
}

function getLastNonWhitespaceObject(
  tokens: RulesetParserObject[]
): RulesetParserObject | null {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].type !== "WHITESPACE") return tokens[i];
  }

  return null;
}

function parseTermElement(
  state: ParserState,
  children: RulesetParserObject[]
): [boolean, ParserState] {
  const [termObject, newState] = parseTerm(state);

  if (!termObject) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
      newState,
      `Expected term, but found ${peek(newState)?.type}` // Fixed state reference
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
