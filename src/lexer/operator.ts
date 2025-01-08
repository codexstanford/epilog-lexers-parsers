import type { LexerState } from "../types";
import { createToken } from "./_common";

export function handleOperator(state: LexerState): void {
  const start = state.pos;
  const next = state.input[state.pos + 1];

  if (state.input[start] === ":") {
    if (next === "-") {
      state.pos += 2;
      state.tokens.push(createToken(state, "RULE_SEPARATOR_NECK", start));
    } else if (next === ":") {
      state.pos += 2;
      state.tokens.push(createToken(state, "DOUBLE_COLON", start));
    } else if (next === "=") {
      state.pos += 2;
      state.tokens.push(createToken(state, "DEFINITION_SEPARATOR", start));
    } else {
      state.pos++;
      state.tokens.push(createToken(state, "ERROR", start, "Invalid operator"));
    }
    return;
  }

  if (
    state.input[start] === "=" &&
    next === "=" &&
    state.input[state.pos + 2] === ">"
  ) {
    state.pos += 3;
    state.tokens.push(createToken(state, "DOUBLE_ARROW", start));
    return;
  }

  state.pos++;
  state.tokens.push(createToken(state, "ERROR", start, "Invalid operator"));
}
