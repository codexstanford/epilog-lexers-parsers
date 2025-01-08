import { describe, expect, it } from "bun:test";
import { rulesetLexer } from "./ruleset-lexer";
import { validateTokenBoundaries } from "./test-utils";

describe("rulesetLexer", () => {
  it("handles rule separator/neck operator (:-)", () => {
    const input = "pred(A) :- p(A), q(A).";
    const tokens = rulesetLexer(input);
    expect(tokens).toEqual([
      { type: "SYMBOL_TERM", start: 0, end: 4, line: 1, content: "pred" },
      { type: "OPEN_PAREN", start: 4, end: 5, line: 1, content: "(" },
      { type: "VARIABLE_NAMED", start: 5, end: 6, line: 1, content: "A" },
      { type: "CLOSE_PAREN", start: 6, end: 7, line: 1, content: ")" },
      { type: "WHITESPACE", start: 7, end: 8, line: 1, content: " " },
      {
        type: "RULE_SEPARATOR_NECK",
        start: 8,
        end: 10,
        line: 1,
        content: ":-",
      },
      { type: "WHITESPACE", start: 10, end: 11, line: 1, content: " " },
      { type: "SYMBOL_TERM", start: 11, end: 12, line: 1, content: "p" },
      { type: "OPEN_PAREN", start: 12, end: 13, line: 1, content: "(" },
      { type: "VARIABLE_NAMED", start: 13, end: 14, line: 1, content: "A" },
      { type: "CLOSE_PAREN", start: 14, end: 15, line: 1, content: ")" },
      { type: "COMMA", start: 15, end: 16, line: 1, content: "," },
      { type: "WHITESPACE", start: 16, end: 17, line: 1, content: " " },
      { type: "SYMBOL_TERM", start: 17, end: 18, line: 1, content: "q" },
      { type: "OPEN_PAREN", start: 18, end: 19, line: 1, content: "(" },
      { type: "VARIABLE_NAMED", start: 19, end: 20, line: 1, content: "A" },
      { type: "CLOSE_PAREN", start: 20, end: 21, line: 1, content: ")" },
      { type: "PERIOD", start: 21, end: 22, line: 1, content: "." },
    ]);
    validateTokenBoundaries(input, tokens);
  });

  it("handles double-colon operator (::)", () => {
    const input = "type :: predicate.";
    const tokens = rulesetLexer(input);
    expect(tokens).toEqual([
      { type: "SYMBOL_TERM", start: 0, end: 4, line: 1, content: "type" },
      { type: "WHITESPACE", start: 4, end: 5, line: 1, content: " " },
      { type: "DOUBLE_COLON", start: 5, end: 7, line: 1, content: "::" },
      { type: "WHITESPACE", start: 7, end: 8, line: 1, content: " " },
      {
        type: "SYMBOL_TERM",
        start: 8,
        end: 18,
        line: 1,
        content: "predicate.",
      },
    ]);
    validateTokenBoundaries(input, tokens);
  });

  it("handles definition separator operator (:=)", () => {
    const input = "func(X) := value.";
    const tokens = rulesetLexer(input);
    expect(tokens).toEqual([
      { type: "SYMBOL_TERM", start: 0, end: 4, line: 1, content: "func" },
      { type: "OPEN_PAREN", start: 4, end: 5, line: 1, content: "(" },
      { type: "VARIABLE_NAMED", start: 5, end: 6, line: 1, content: "X" },
      { type: "CLOSE_PAREN", start: 6, end: 7, line: 1, content: ")" },
      { type: "WHITESPACE", start: 7, end: 8, line: 1, content: " " },
      {
        type: "DEFINITION_SEPARATOR",
        start: 8,
        end: 10,
        line: 1,
        content: ":=",
      },
      { type: "WHITESPACE", start: 10, end: 11, line: 1, content: " " },
      { type: "SYMBOL_TERM", start: 11, end: 17, line: 1, content: "value." },
    ]);
    validateTokenBoundaries(input, tokens);
  });

  it("handles double-arrow operator (==>)", () => {
    const input = "if(X) ==> then(X).";
    const tokens = rulesetLexer(input);
    expect(tokens).toEqual([
      { type: "SYMBOL_TERM", start: 0, end: 2, line: 1, content: "if" },
      { type: "OPEN_PAREN", start: 2, end: 3, line: 1, content: "(" },
      { type: "VARIABLE_NAMED", start: 3, end: 4, line: 1, content: "X" },
      { type: "CLOSE_PAREN", start: 4, end: 5, line: 1, content: ")" },
      { type: "WHITESPACE", start: 5, end: 6, line: 1, content: " " },
      { type: "DOUBLE_ARROW", start: 6, end: 9, line: 1, content: "==>" },
      { type: "WHITESPACE", start: 9, end: 10, line: 1, content: " " },
      { type: "SYMBOL_TERM", start: 10, end: 14, line: 1, content: "then" },
      { type: "OPEN_PAREN", start: 14, end: 15, line: 1, content: "(" },
      { type: "VARIABLE_NAMED", start: 15, end: 16, line: 1, content: "X" },
      { type: "CLOSE_PAREN", start: 16, end: 17, line: 1, content: ")" },
      { type: "PERIOD", start: 17, end: 18, line: 1, content: "." },
    ]);
    validateTokenBoundaries(input, tokens);
  });

  it("handles complex rule with multiple operators", () => {
    const input = "type::pred(A) :- p(A), q(A) ==> result := value.";
    const tokens = rulesetLexer(input);
    expect(tokens.map((t) => t.type)).toEqual([
      "SYMBOL_TERM",
      "DOUBLE_COLON",
      "SYMBOL_TERM",
      "OPEN_PAREN",
      "VARIABLE_NAMED",
      "CLOSE_PAREN",
      "WHITESPACE",
      "RULE_SEPARATOR_NECK",
      "WHITESPACE",
      "SYMBOL_TERM",
      "OPEN_PAREN",
      "VARIABLE_NAMED",
      "CLOSE_PAREN",
      "COMMA",
      "WHITESPACE",
      "SYMBOL_TERM",
      "OPEN_PAREN",
      "VARIABLE_NAMED",
      "CLOSE_PAREN",
      "WHITESPACE",
      "DOUBLE_ARROW",
      "WHITESPACE",
      "SYMBOL_TERM",
      "WHITESPACE",
      "DEFINITION_SEPARATOR",
      "WHITESPACE",
      "SYMBOL_TERM",
    ]);
    validateTokenBoundaries(input, tokens);
  });
});
