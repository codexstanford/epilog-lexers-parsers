import type { DatasetToken, DatasetTokenType } from "./types";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

export function isWhitespace(char: string): boolean {
  return /[\s\n\r\t]/.test(char);
}

export function isConstantStart(char: string): boolean {
  return /[a-z0-9]/.test(char);
}

export function isConstantChar(char: string): boolean {
  return /[a-z0-9._]/.test(char);
}

export function isDigit(char: string): boolean {
  return /[0-9]/.test(char);
}

/* -------------------------------------------------------------------------- */
/*                                    Main                                    */
/* -------------------------------------------------------------------------- */

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
          // Push current whitespace token if any
          if (pos > start) {
            tokens.push({
              type: "WHITESPACE",
              start: start,
              end: pos,
              line,
              content: input.slice(start, pos),
            });
          }
          // Increment line counter and update start position
          line++;
          pos++;
          start = pos;
        } else {
          pos++;
        }
      }

      // Push remaining whitespace if any
      if (pos > start) {
        tokens.push({
          type: "WHITESPACE",
          start: start,
          end: pos,
          line,
          content: input.slice(start, pos),
        });
      }

      continue;
    }

    // Handle numbers
    if (isDigit(char)) {
      while (pos < input.length && isDigit(input[pos])) {
        pos++;
      }
      // Optional decimal part
      if (input[pos] === "." && isDigit(input[pos + 1])) {
        pos++; // consume dot
        while (pos < input.length && isDigit(input[pos])) {
          pos++;
        }
      }
      tokens.push({
        type: "NUMBER",
        start,
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
          type: "ERROR",
          start,
          end: pos,
          line,
          content: input.slice(start, pos),
          errorMessage: "Constants cannot start with underscore",
        });
      } else {
        tokens.push({
          type: "CONSTANT",
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
          type: "ERROR",
          start,
          end: pos,
          line,
          content: input.slice(start, pos),
          errorMessage: "Unterminated string",
        });
      } else {
        pos++; // Include closing quote
        tokens.push({
          type: "STRING",
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
        type: "COMMENT",
        start,
        end: pos,
        line,
        content: input.slice(start, pos),
      });
      continue;
    }

    // Handle single-character tokens
    const tokenMap: { [key: string]: DatasetTokenType } = {
      "(": "OPEN_PAREN",
      ")": "CLOSE_PAREN",
      "[": "OPEN_BRACKET",
      "]": "CLOSE_BRACKET",
      "!": "LIST_SEPARATOR",
      ",": "COMMA",
      ".": "PERIOD",
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
      type: "ERROR",
      start,
      end: pos,
      line,
      content: char,
      errorMessage: `Unexpected character: ${char}`,
    });
  }

  return tokens;
}
