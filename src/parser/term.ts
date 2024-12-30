import type { ParserState, RulesetParserObject } from "../types";
import { parseCompoundTerm } from "./compound-term";
import { parseConstantTerm } from "./constant-term";
import { parseListTerm } from "./list-term";

/**
 * Child is one of the following:
 * - constant term
 * - compound term
 * - list term
 * @param state
 */
export function parseTerm(
  state: ParserState
): [RulesetParserObject | null, ParserState] {
  // Try parsing compound term
  const [compoundResult, compoundState] = parseCompoundTerm(state);
  if (compoundResult) {
    return [
      {
        type: "TERM",
        start: compoundResult.start,
        end: compoundResult.end,
        line: compoundResult.line,
        content: compoundResult.content,
        children: [compoundResult],
      },
      compoundState,
    ];
  }

  // Try parsing list term
  const [listResult, listState] = parseListTerm(state);
  if (listResult) {
    return [
      {
        type: "TERM",
        start: listResult.start,
        end: listResult.end,
        line: listResult.line,
        content: listResult.content,
        children: [listResult],
      },
      listState,
    ];
  }

  // Try parsing constant term
  const [constantResult, constantState] = parseConstantTerm(state);
  if (constantResult) {
    return [
      {
        type: "TERM",
        start: constantResult.start,
        end: constantResult.end,
        line: constantResult.line,
        content: constantResult.content,
        children: [constantResult],
      },
      constantState,
    ];
  }

  return [null, state];
}
