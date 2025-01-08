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
  // The following are only supported for rulesets
  "&": "AMPERSAND",
  "~": "NEGATION_SYMBOL",
  _: "VARIABLE_ANONYMOUS",
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

export function isConstantChar(char: string): boolean {
  return /[a-z0-9_.]/.test(char);
}

export function isDigit(char: string): boolean {
  return /[0-9]/.test(char);
}

export function isVariableStart(char: string): boolean {
  return /[A-Z_]/.test(char);
}

export function isVariableChar(char: string): boolean {
  return /[A-Za-z0-9_]/.test(char);
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

export function createLexerState(input: string): LexerState {
  const state: LexerState = {
    input,
    pos: 0,
    line: 1,
    lineBeganAtPos: 0,
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
    line: state.line,
    start: start - state.lineBeganAtPos,
    end: state.pos - state.lineBeganAtPos,
    content: state.input.slice(start, state.pos),
    ...(errorMessage && { errorMessage }),
  };
}
