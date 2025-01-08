import type { LexerState } from "../types";
import { createToken, isVariableChar } from "./_common";

export function handleVariable(state: LexerState): void {
  const start = state.pos;

  if (
    state.input[start] === "_" &&
    (state.pos + 1 >= state.input.length ||
      !isVariableChar(state.input[state.pos + 1]))
  ) {
    state.pos++;
    state.tokens.push(createToken(state, "VARIABLE_ANONYMOUS", start));
    return;
  }

  while (
    state.pos < state.input.length &&
    isVariableChar(state.input[state.pos])
  ) {
    state.pos++;
  }

  state.tokens.push(createToken(state, "VARIABLE_NAMED", start));
}
