import type { LexerState, RulesetToken, RulesetTokenType } from "../types";

/* -------------------------------------------------------------------------- */
/*                                    Const                                   */
/* -------------------------------------------------------------------------- */

export const SINGLE_CHAR_TOKENS: { [key: string]: RulesetTokenType } = {
  "(": "OPEN_PAREN",
  ")": "CLOSE_PAREN",
  "[": "OPEN_BRACKET",
  "]": "CLOSE_BRACKET",
  "!": "LIST_SEPARATOR",
  ",": "COMMA",
  ".": "PERIOD",
};

/* -------------------------------------------------------------------------- */
/*                                    RegEx                                   */
/* -------------------------------------------------------------------------- */

export function isWhitespace(char: string): boolean {
  return /[\s\n\r\t]/.test(char);
}

export function isConstantStart(char: string): boolean {
  return /[a-z0-9]/.test(char);
}

// Constants can contain letters, numbers, and underscores
// They can also contain periods, but only if followed by another constant character
// This check is done in the handleConstant function
export function isConstantChar(char: string): boolean {
  return /[a-z0-9_]/.test(char);
}

export function isDigit(char: string): boolean {
  return /[0-9]/.test(char);
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

export function createLexerState(input: string): LexerState {
  const state: LexerState = {
    input,
    pos: 0,
    line: 1,
    tokens: [],
  };

  return state;
}

export function createToken(
  state: LexerState,
  type: RulesetTokenType,
  start: number,
  errorMessage?: string
): RulesetToken {
  return {
    type,
    start,
    end: state.pos,
    line: state.line,
    content: state.input.slice(start, state.pos),
    ...(errorMessage && { errorMessage }),
  };
}
