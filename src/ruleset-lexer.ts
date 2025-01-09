import {
  createLexerState,
  createToken,
  isConstantStart,
  isDigit,
  isWhitespace,
  isVariableStart,
  SINGLE_CHAR_TOKENS,
} from "./lexer/_common";
import { handleComment } from "./lexer/comment";
import { handleConstant } from "./lexer/constant";
import { handleNumber } from "./lexer/number";
import { handleString } from "./lexer/string";
import { handleWhitespace } from "./lexer/whitespace";
import { handleVariable } from "./lexer/variable";
import { handleOperator } from "./lexer/operator";
import type { LexerState, Token } from "./types";

export function rulesetLexer(input: string): Token[] {
  const state: LexerState = createLexerState(input);

  while (state.pos < input.length) {
    const char = input[state.pos];
    const start = state.pos;

    if (isWhitespace(char)) {
      handleWhitespace(state);
    } else if (
      isDigit(char) ||
      (char === "-" && isDigit(input[state.pos + 1]))
    ) {
      handleNumber(state);
    } else if (isVariableStart(char)) {
      // This needs to come before SINGLE_CHAR_TOKENS
      // to make sure it is not a named variable starting with an underscore
      handleVariable(state);
    } else if (isConstantStart(char)) {
      handleConstant(state);
    } else if (char === '"') {
      handleString(state);
    } else if (char === "%") {
      handleComment(state);
    } else if (char === ":" || char === "=") {
      handleOperator(state);
    } else if (char in SINGLE_CHAR_TOKENS) {
      state.pos++;
      state.tokens.push(createToken(state, SINGLE_CHAR_TOKENS[char], start));
    } else {
      state.pos++;
      state.tokens.push(
        createToken(state, "ERROR", start, `Unexpected character: ${char}`)
      );
    }
  }

  return state.tokens;
}
