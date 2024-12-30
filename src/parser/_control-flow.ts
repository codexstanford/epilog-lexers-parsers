import type { ParserState, RulesetToken } from "../types";

/**
 * Creates initial parser state from tokens, filtering out whitespace and comments
 * @param tokens Raw tokens from lexer
 * @returns Clean parser state ready for processing
 */
export function createState(
  tokens: RulesetToken[],
  setType: "DATASET" | "RULESET"
): ParserState {
  return {
    setType,
    tokens: tokens.filter(
      (t) => t.type !== "WHITESPACE" && t.type !== "COMMENT"
    ),
    current: 0,
  };
}

/**
 * Looks at the current token without consuming it
 * @param state Current parser state
 * @returns The current token or null if at end of input
 */
export function peek(state: ParserState): RulesetToken | null {
  return state.current < state.tokens.length
    ? state.tokens[state.current]
    : null;
}

/**
 * Consumes and returns the current token, advancing the parser state
 * @param state Current parser state
 * @returns Tuple of [consumed token, new state]
 */
export function advance(
  state: ParserState
): [RulesetToken | null, ParserState] {
  if (state.current >= state.tokens.length) return [null, state];
  const token = state.tokens[state.current];
  return [token, { ...state, current: state.current + 1 }];
}
