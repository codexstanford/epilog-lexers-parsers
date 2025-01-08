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
import { parseAtom } from "./atom";
import { parseLiteral } from "./literal";

/**
 * Children are as follows:
 * - atom
 * - (optional)
 *   - rule neck
 *   - one or more ampersand-separated literals
 * - (optional) punctuation period
 * @param state
 */
export function parseRule(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  const [atomResult, atomState] = parseAtom(state);
  if (!atomResult) return [null, state];

  const children: RulesetParserObject[] = [atomResult];
  let currentState = atomState;
  let hasError = false;

  // Consume whitespaces and comments before rule neck
  const [whitespaceObjects, stateAfterWhitespace] =
    consumeWhitespacesAndComments(currentState);
  children.push(...whitespaceObjects);
  currentState = stateAfterWhitespace;

  // Check for rule neck (optional)
  const ruleNeck = peek(currentState);
  if (ruleNeck?.type === "RULE_SEPARATOR_NECK") {
    children.push(ruleNeck);
    currentState = advance(currentState)[1];

    // Parse literals and ampersands
    while (true) {
      const token = peek(currentState);

      if (!token || token.type === "PERIOD") {
        // EOF or period is only allowed if last token was not an ampersand
        // So, add an error if this is the case
        // Otherwise, we are done parsing the rule
        const lastNonWhitespaceToken =
          getLastNonWhitespaceOrCommentObject(children);

        if (!lastNonWhitespaceToken)
          throw Error(
            "If we get here, lastNonWhitespaceToken should at least be the RULE_SEPARATOR_NECK"
          );

        if (lastNonWhitespaceToken.type === "AMPERSAND") {
          hasError = true;
          const [errorObject, errorState] =
            createErrorObjectAndAdvanceToNextLine(
              currentState,
              "An ampersand must be followed by a literal, got instead:" +
                (token ? token?.type : "EOF")
            );
          children.push(errorObject);
          currentState = errorState;
        }

        break;
      }

      if (isWhitespaceOrComment(token)) {
        children.push(token);
        currentState = advance(currentState)[1];
        continue;
      }

      const [shouldContinue, newState] = parseRuleBodyElement(
        currentState,
        children
      );
      currentState = newState;

      if (!shouldContinue) {
        hasError = children[children.length - 1].type === "ERROR";
        break;
      }
    }
  }

  // We do not need to consume whitespaces and comments here.
  // If there was no rule neck, we have already consumed them.
  // If there was a rule neck, we have already consumed them in the loop above.

  // Check for optional period
  const period = peek(currentState);
  if (period?.type === "PERIOD") {
    children.push(period);
    currentState = advance(currentState)[1];
  }

  return [
    createParserObject(
      "RULE",
      children,
      hasError ? "Invalid rule structure" : undefined
    ),
    currentState,
  ];
}

/**
 * Parses an element in the rule body based on the current parser state and the list of parsed children.
 *
 * This function determines whether the next element to be parsed is a literal or an ampersand element
 * based on the type of the last non-whitespace token. If the last non-whitespace token is either a
 * `RULE_SEPARATOR_NECK` or an `AMPERSAND`, it expects the next element to be a literal. Otherwise,
 * it expects an ampersand element.
 *
 * @param state - The current state of the parser.
 * @param children - The list of parsed children elements.
 * @returns A tuple where the first element is a boolean indicating if the loop shall continue, and the second element is the updated parser state.
 *
 * @throws Error if the last non-whitespace token is not found, which should not happen as the last non-whitespace token should at least be the `RULE_SEPARATOR_NECK`.
 *
 * @remarks
 * This function ensures that no two literals will be parsed consecutively.
 */
function parseRuleBodyElement(
  state: ParserState,
  children: RulesetParserObject[]
): [boolean, ParserState] {
  const lastNonWhitespaceToken = getLastNonWhitespaceOrCommentObject(children);

  if (!lastNonWhitespaceToken)
    throw Error(
      "If we get here, lastNonWhitespaceToken should at least be the RULE_SEPARATOR_NECK"
    );

  const isExpectingLiteral =
    lastNonWhitespaceToken.type === "RULE_SEPARATOR_NECK" ||
    lastNonWhitespaceToken.type === "AMPERSAND";

  if (isExpectingLiteral) {
    return parseLiteralElement(state, children);
  }

  // It's okay if no ampersand is found
  // Then, the rule body has ended
  // We need to support this as periods are optional
  return parseOptionalAmpersandElement(state, children);
}

function parseLiteralElement(
  state: ParserState,
  children: RulesetParserObject[]
): [boolean, ParserState] {
  const [literalObject, newState] = parseLiteral(state);

  if (!literalObject) {
    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
      state,
      `Expected literal, but found ${peek(state)?.type}`
    );
    children.push(errorObject);
    return [false, errorState];
  }

  children.push(literalObject);
  return [true, newState];
}

function parseOptionalAmpersandElement(
  state: ParserState,
  children: RulesetParserObject[]
): [boolean, ParserState] {
  const token = peek(state);

  if (token?.type !== "AMPERSAND") {
    return [false, state];
  }

  children.push(token);
  return [true, advance(state)[1]];
}
