import type { LexerState } from "../types";
import { isDigit, createToken } from "./_common";

export function handleNumber(state: LexerState): void {
  const start = state.pos;

  // Check for minus sign
  if (state.input[state.pos] === "-") {
    state.pos++;
  }

  while (state.pos < state.input.length && isDigit(state.input[state.pos])) {
    state.pos++;
  }

  if (state.input[state.pos] === "." && isDigit(state.input[state.pos + 1])) {
    state.pos++;
    while (state.pos < state.input.length && isDigit(state.input[state.pos])) {
      state.pos++;
    }
  }

  state.tokens.push(createToken(state, "NUMBER", start));
}
