import type { LexerState } from "../types";
import { createToken, isWhitespace } from "./_common";

export function handleWhitespace(state: LexerState): void {
  const start = state.pos;

  while (
    state.pos < state.input.length &&
    isWhitespace(state.input[state.pos])
  ) {
    if (state.input[state.pos] === "\n") {
      if (state.pos > start) {
        state.tokens.push(createToken(state, "WHITESPACE", start));
      }
      state.line++;
      state.pos++;
      return;
    }
    state.pos++;
  }

  if (state.pos > start) {
    state.tokens.push(createToken(state, "WHITESPACE", start));
  }
}
