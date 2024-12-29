/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export enum DatasetTokenType {
  // a string of lowercase letters, digits, underscores, and periods, not beginning with an underscore
  CONSTANT = "CONSTANT",
  // any sequence of characters within double quotes, but newline characters must be explicit
  STRING = "STRING",
  // (
  OPEN_PAREN = "OPEN_PAREN",
  // )
  CLOSE_PAREN = "CLOSE_PAREN",
  // [
  OPEN_BRACKET = "OPEN_BRACKET",
  // ]
  CLOSE_BRACKET = "CLOSE_BRACKET",
  // !
  LIST_SEPARATOR = "LIST_SEPARATOR",
  // ,
  COMMA = "COMMA",
  // % to end of line
  COMMENT = "COMMENT",
  // .
  PERIOD = "PERIOD",
  // lexing errors
  ERROR = "ERROR",
  // spaces, tabs
  WHITESPACE = "WHITESPACE",
}

export type DatasetToken = {
  type: DatasetTokenType;
  start: number;
  end: number;
  /**
   * Non-whitespace tokens cannot span multiple lines, so if lexing error occurs
   * can have error token span rest of line until terminal whitespace, then continue lexing from next line
   */
  line: number;
  content: string;
  errorMessage?: string;
};

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export function isWhitespace(char: string): boolean {
  return /[\s\n\r\t]/.test(char);
}

function isConstantStart(char: string): boolean {
  return /[a-z0-9]/.test(char);
}

function isConstantChar(char: string): boolean {
  return /[a-z0-9._]/.test(char);
}

export function datasetLexer(input: string): DatasetToken[] {
  const tokens: DatasetToken[] = [];
  let pos = 0;
  let line = 1;

  while (pos < input.length) {
    let start = pos;
    const char = input[pos];

    // Handle whitespace
    if (isWhitespace(char)) {
      while (pos < input.length && isWhitespace(input[pos])) {
        if (input[pos] === "\n") {
          line++;
        }
        pos++;
      }
      tokens.push({
        type: DatasetTokenType.WHITESPACE,
        start: start,
        end: pos,
        line,
        content: input.slice(start, pos),
      });
      continue;
    }

    // Handle constants
    if (isConstantStart(char)) {
      while (pos < input.length && isConstantChar(input[pos])) {
        pos++;
      }
      if (input[start] === "_") {
        tokens.push({
          type: DatasetTokenType.ERROR,
          start,
          end: pos,
          line,
          content: input.slice(start, pos),
          errorMessage: "Constants cannot start with underscore",
        });
      } else {
        tokens.push({
          type: DatasetTokenType.CONSTANT,
          start,
          end: pos,
          line,
          content: input.slice(start, pos),
        });
      }
      continue;
    }

    // Handle strings
    if (char === '"') {
      pos++;
      while (pos < input.length && input[pos] !== '"' && input[pos] !== "\n") {
        pos++;
      }
      if (pos >= input.length || input[pos] === "\n") {
        tokens.push({
          type: DatasetTokenType.ERROR,
          start,
          end: pos,
          line,
          content: input.slice(start, pos),
          errorMessage: "Unterminated string",
        });
      } else {
        pos++; // Include closing quote
        tokens.push({
          type: DatasetTokenType.STRING,
          start,
          end: pos,
          line,
          content: input.slice(start, pos),
        });
      }
      continue;
    }

    // Handle comments
    if (char === "%") {
      while (pos < input.length && input[pos] !== "\n") {
        pos++;
      }
      tokens.push({
        type: DatasetTokenType.COMMENT,
        start,
        end: pos,
        line,
        content: input.slice(start, pos),
      });
      continue;
    }

    // Handle single-character tokens
    const tokenMap: { [key: string]: DatasetTokenType } = {
      "(": DatasetTokenType.OPEN_PAREN,
      ")": DatasetTokenType.CLOSE_PAREN,
      "[": DatasetTokenType.OPEN_BRACKET,
      "]": DatasetTokenType.CLOSE_BRACKET,
      "!": DatasetTokenType.LIST_SEPARATOR,
      ",": DatasetTokenType.COMMA,
      ".": DatasetTokenType.PERIOD,
    };

    if (char in tokenMap) {
      pos++;
      tokens.push({
        type: tokenMap[char],
        start,
        end: pos,
        line,
        content: char,
      });
      continue;
    }

    // Handle unknown characters
    pos++;
    tokens.push({
      type: DatasetTokenType.ERROR,
      start,
      end: pos,
      line,
      content: char,
      errorMessage: `Unexpected character: ${char}`,
    });
  }

  return tokens;
}
