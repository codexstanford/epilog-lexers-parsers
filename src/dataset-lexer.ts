import {
  createToken,
  isConstantStart,
  isDigit,
  isWhitespace,
  SINGLE_CHAR_TOKENS,
} from "./lexer/_common";
import { handleComment } from "./lexer/comment";
import { handleConstant } from "./lexer/constant";
import { handleNumber } from "./lexer/number";
import { handleString } from "./lexer/string";
import { handleWhitespace } from "./lexer/whitespace";
import type { LexerState, RulesetToken } from "./types";

export function datasetLexer(input: string): RulesetToken[] {
  const state: LexerState = {
    input,
    pos: 0,
    line: 1,
    tokens: [],
  };

  while (state.pos < input.length) {
    const char = input[state.pos];
    const start = state.pos;

    if (isWhitespace(char)) {
      handleWhitespace(state);
    } else if (isDigit(char)) {
      handleNumber(state);
    } else if (isConstantStart(char)) {
      handleConstant(state);
    } else if (char === '"') {
      handleString(state);
    } else if (char === "%") {
      handleComment(state);
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
