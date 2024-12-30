import type { LexerState } from "../types";
import { isConstantChar, createToken } from "./_common";

export function handleConstant(state: LexerState): void {
  const start = state.pos;

  // move pointer to the end of the constant
  while (
    state.pos < state.input.length &&
    (isConstantChar(state.input[state.pos]) ||
      // Periods are allowed only if followed by another constant character
      (state.input[state.pos] === "." &&
        isConstantChar(state.input[state.pos + 1])))
  ) {
    state.pos++;
  }

  if (state.input[start] === "_") {
    state.tokens.push(
      createToken(
        state,
        "ERROR",
        start,
        "Constants cannot start with underscore"
      )
    );
    return;
  }

  state.tokens.push(createToken(state, "CONSTANT", start));
}
