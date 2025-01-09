import type { ParserState, ParserObject, Token } from "../types";

/**
 * Creates initial parser state from tokens, filtering out whitespace and comments
 * @param tokens Raw tokens from lexer
 * @returns Clean parser state ready for processing
 */
export function createParserState(
  tokens: Token[],
  setType: "DATASET" | "RULESET"
): ParserState {
  return {
    setType,
    tokens,
    current: 0,
  };
}

/**
 * Looks at the current token without consuming it
 * @param state Current parser state
 * @returns The current token or null if at end of input
 */
export function peek(state: ParserState): Token | null {
  return state.current < state.tokens.length
    ? state.tokens[state.current]
    : null;
}

/**
 * Consumes and returns the current token, advancing the parser state
 * @param state Current parser state
 * @returns Tuple of [consumed token, new state]
 */
export function advance(state: ParserState): [Token | null, ParserState] {
  if (state.current >= state.tokens.length) return [null, state];
  const token = state.tokens[state.current];
  return [token, { ...state, current: state.current + 1 }];
}

export function createErrorObjectAndAdvanceToNextLine(
  state: ParserState,
  errorMessage: string
): [ParserObject, ParserState] {
  let currentToken = peek(state);

  if (!currentToken)
    return [
      {
        type: "ERROR",
        start: state.tokens[state.tokens.length - 1].end,
        end: state.tokens[state.tokens.length - 1].end + 1,
        line: state.tokens[state.tokens.length - 1].line,
        content: "",
        errorMessage,
      },
      state,
    ];

  const children: Token[] = [];
  const currentLine = currentToken.line;
  let currentState = state;

  while (currentToken && currentToken.line === currentLine) {
    children.push(currentToken);
    currentState = advance(currentState)[1];
    currentToken = peek(currentState);
  }

  return [
    {
      type: "ERROR",
      start: children[0].start,
      end: children[children.length - 1].end,
      line: children[0].line,
      content: children.map((c) => c.content).join(""),
      errorMessage,
      children,
    },
    currentState,
  ];
}
