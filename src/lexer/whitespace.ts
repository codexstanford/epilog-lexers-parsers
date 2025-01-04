import type { LexerState } from "../types";
import { createToken, isWhitespace } from "./_common";

export function handleWhitespace(state: LexerState): void {
  const start = state.pos;

  while (
    state.pos < state.input.length &&
    isWhitespace(state.input[state.pos])
  ) {
    if (state.input[state.pos] === "\n") {
      state.pos++;
      state.tokens.push(createToken(state, "WHITESPACE", start));
      state.line++;
      state.lineBeganAtPos = state.pos;
      return;
    }
    state.pos++;
  }

  state.tokens.push(createToken(state, "WHITESPACE", start));
}
