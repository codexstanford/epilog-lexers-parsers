import type { LexerState } from "../types";
import { createToken } from "./_common";

export function handleString(state: LexerState): void {
  const start = state.pos;
  state.pos++;

  while (
    state.pos < state.input.length &&
    state.input[state.pos] !== '"' &&
    state.input[state.pos] !== "\n"
  ) {
    state.pos++;
  }

  if (state.pos >= state.input.length || state.input[state.pos] === "\n") {
    state.tokens.push(
      createToken(state, "ERROR", start, "Unterminated string")
    );
  } else {
    state.pos++;
    state.tokens.push(createToken(state, "STRING", start));
  }
}
