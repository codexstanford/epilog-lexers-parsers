import type { LexerState } from "../types";
import { createToken } from "./_common";

export function handleComment(state: LexerState): void {
  const start = state.pos;

  while (state.pos < state.input.length && state.input[state.pos] !== "\n") {
    state.pos++;
  }

  state.tokens.push(createToken(state, "COMMENT", start));
}
