import type { ParserState, ParserObject } from "../types";
import { createParserObject } from "./_common";
import { parseCompoundTerm } from "./compound-term";
import { parseSimpleTerm } from "./simple-term";
import { parseListTerm } from "./list-term";
import { parseVariable } from "./variable";

/**
 * Child is one of the following:
 * - constant term
 * - compound term
 * - list term
 * - variable (if allowed)
 * @param state
 * @param checkExclamationSeparated Needed to prevent endless recursion
 */
export function parseTerm(
  state: ParserState,
  checkExclamationSeparated = true
): [ParserObject | null, ParserState] {
  // Try parsing compound term
  const [compoundResult, compoundState] = parseCompoundTerm(state);
  if (compoundResult) {
    return [createParserObject("TERM", [compoundResult]), compoundState];
  }

  // Try parsing list term
  const [listResult, listState] = parseListTerm(
    state,
    checkExclamationSeparated
  );
  if (listResult) {
    return [createParserObject("TERM", [listResult]), listState];
  }

  // Try parsing constant term
  const [constantResult, constantState] = parseSimpleTerm(state);
  if (constantResult) {
    return [createParserObject("TERM", [constantResult]), constantState];
  }

  if (state.setType === "DATASET") return [null, state];

  // Try parsing variable
  const [variableResult, variableState] = parseVariable(state);
  if (variableResult) {
    return [createParserObject("TERM", [variableResult]), variableState];
  }

  return [null, state];
}
