import { datasetLexer } from "./dataset-lexer";
import type { RulesetToken } from "./types";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function isVariableNamedStart(char: string): boolean {
  return /[A-Z]/.test(char);
}

function isVariableChar(char: string): boolean {
  return /[A-Za-z0-9_]/.test(char);
}

/* -------------------------------------------------------------------------- */
/*                                    Main                                    */
/* -------------------------------------------------------------------------- */

export function rulesetLexer(input: string): RulesetToken[] {
  const tokens: RulesetToken[] = [];
  let pos = 0;
  let line = 1;

  while (pos < input.length) {
    let start = pos;
    const char = input[pos];
    const nextChar = pos + 1 < input.length ? input[pos + 1] : "";
    const next2Chars = input.slice(pos, pos + 2);
    const next3Chars = input.slice(pos, pos + 3);

    // Handle anonymous variable (_)
    if (char === "_") {
      pos++;
      tokens.push({
        type: "VARIABLE_ANONYMOUS",
        start,
        end: pos,
        line,
        content: "_",
      });
      continue;
    }

    // Handle variable names (starting with uppercase)
    if (isVariableNamedStart(char)) {
      while (pos < input.length && isVariableChar(input[pos])) {
        pos++;
      }
      tokens.push({
        type: "VARIABLE_NAMED",
        start,
        end: pos,
        line,
        content: input.slice(start, pos),
      });
      continue;
    }

    // Handle multi-character operators
    if (next3Chars === "==>") {
      pos += 3;
      tokens.push({
        type: "DOUBLE_ARROW",
        start,
        end: pos,
        line,
        content: "==>",
      });
      continue;
    }

    if (next2Chars === ":-") {
      pos += 2;
      tokens.push({
        type: "RULE_SEPARATOR_NECK",
        start,
        end: pos,
        line,
        content: ":-",
      });
      continue;
    }

    if (next2Chars === "::") {
      pos += 2;
      tokens.push({
        type: "DOUBLE_COLON",
        start,
        end: pos,
        line,
        content: "::",
      });
      continue;
    }

    if (next2Chars === ":=") {
      pos += 2;
      tokens.push({
        type: "DEFINITION_SEPARATOR",
        start,
        end: pos,
        line,
        content: ":=",
      });
      continue;
    }

    // Handle single-character operators
    if (char === "&") {
      pos++;
      tokens.push({
        type: "AMPERSAND",
        start,
        end: pos,
        line,
        content: "&",
      });
      continue;
    }

    if (char === "~") {
      pos++;
      tokens.push({
        type: "NEGATION_SYMBOL",
        start,
        end: pos,
        line,
        content: "~",
      });
      continue;
    }

    // Use datasetLexer for remaining tokens
    const datasetToken = datasetLexer(input.slice(pos))[0];
    if (datasetToken) {
      // Adjust position and line number based on token content
      const newlines = (datasetToken.content.match(/\n/g) || []).length;
      line += newlines;
      datasetToken.line = line; // Add this line to update token's line number
      datasetToken.start += pos;
      datasetToken.end += pos;
      tokens.push(datasetToken as RulesetToken);
      pos += datasetToken.content.length;
      continue;
    }

    // Handle unexpected characters
    pos++;
    tokens.push({
      type: "ERROR" as const,
      start,
      end: pos,
      line,
      content: char,
      errorMessage: `Unexpected character: ${char}`,
    });
  }

  return tokens;
}
