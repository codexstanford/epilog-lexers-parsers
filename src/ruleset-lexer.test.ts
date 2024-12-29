import { expect, test, describe } from "bun:test";
import { rulesetLexer } from "./ruleset-lexer";
import { validateTokenBoundaries } from "./test-utils";

describe("rulesetLexer", () => {
  test("lexes named variables", () => {
    const input = "parent(Person, Child)";
    const tokens = rulesetLexer(input);
    validateTokenBoundaries(input, tokens);

    expect(tokens[0].type).toBe("CONSTANT");
    expect(tokens[1].type).toBe("OPEN_PAREN");
    expect(tokens[2].type).toBe("VARIABLE_NAMED");
    expect(tokens[2].content).toBe("Person");
    expect(tokens[3].type).toBe("COMMA");
    expect(tokens[4].type).toBe("WHITESPACE");
    expect(tokens[5].type).toBe("VARIABLE_NAMED");
    expect(tokens[5].content).toBe("Child");
    expect(tokens[6].type).toBe("CLOSE_PAREN");
  });

  test("lexes anonymous variables", () => {
    const input = "parent(_, Child)";
    const tokens = rulesetLexer(input);
    validateTokenBoundaries(input, tokens);

    expect(tokens[0].type).toBe("CONSTANT");
    expect(tokens[0].content).toBe("parent");
    expect(tokens[1].type).toBe("OPEN_PAREN");
    expect(tokens[1].content).toBe("(");
    expect(tokens[2].type).toBe("VARIABLE_ANONYMOUS");
    expect(tokens[2].content).toBe("_");
    expect(tokens[3].type).toBe("COMMA");
    expect(tokens[3].content).toBe(",");
    expect(tokens[4].type).toBe("WHITESPACE");
    expect(tokens[4].content).toBe(" ");
    expect(tokens[5].type).toBe("VARIABLE_NAMED");
    expect(tokens[5].content).toBe("Child");
    expect(tokens[6].type).toBe("CLOSE_PAREN");
    expect(tokens[6].content).toBe(")");
  });

  test("lexes rule operators", () => {
    const input = "grandparent(X, Y) :- parent(X, Z) & parent(Z, Y).";
    const tokens = rulesetLexer(input);
    validateTokenBoundaries(input, tokens);

    expect(tokens[0].type).toBe("CONSTANT");
    expect(tokens[0].content).toBe("grandparent");
    expect(tokens[1].type).toBe("OPEN_PAREN");
    expect(tokens[1].content).toBe("(");
    expect(tokens[2].type).toBe("VARIABLE_NAMED");
    expect(tokens[2].content).toBe("X");
    expect(tokens[3].type).toBe("COMMA");
    expect(tokens[3].content).toBe(",");
    expect(tokens[4].type).toBe("WHITESPACE");
    expect(tokens[4].content).toBe(" ");
    expect(tokens[5].type).toBe("VARIABLE_NAMED");
    expect(tokens[5].content).toBe("Y");
    expect(tokens[6].type).toBe("CLOSE_PAREN");
    expect(tokens[6].content).toBe(")");
    expect(tokens[7].type).toBe("WHITESPACE");
    expect(tokens[7].content).toBe(" ");
    expect(tokens[8].type).toBe("RULE_SEPARATOR_NECK");
    expect(tokens[8].content).toBe(":-");
    expect(tokens[9].type).toBe("WHITESPACE");
    expect(tokens[9].content).toBe(" ");
    expect(tokens[10].type).toBe("CONSTANT");
    expect(tokens[10].content).toBe("parent");
    expect(tokens[11].type).toBe("OPEN_PAREN");
    expect(tokens[11].content).toBe("(");
    expect(tokens[12].type).toBe("VARIABLE_NAMED");
    expect(tokens[12].content).toBe("X");
    expect(tokens[13].type).toBe("COMMA");
    expect(tokens[13].content).toBe(",");
    expect(tokens[14].type).toBe("WHITESPACE");
    expect(tokens[14].content).toBe(" ");
    expect(tokens[15].type).toBe("VARIABLE_NAMED");
    expect(tokens[15].content).toBe("Z");
    expect(tokens[16].type).toBe("CLOSE_PAREN");
    expect(tokens[16].content).toBe(")");
    expect(tokens[17].type).toBe("WHITESPACE");
    expect(tokens[17].content).toBe(" ");
    expect(tokens[18].type).toBe("AMPERSAND");
    expect(tokens[18].content).toBe("&");
    expect(tokens[19].type).toBe("WHITESPACE");
    expect(tokens[19].content).toBe(" ");
    expect(tokens[20].type).toBe("CONSTANT");
    expect(tokens[20].content).toBe("parent");
    expect(tokens[21].type).toBe("OPEN_PAREN");
    expect(tokens[21].content).toBe("(");
    expect(tokens[22].type).toBe("VARIABLE_NAMED");
    expect(tokens[22].content).toBe("Z");
    expect(tokens[23].type).toBe("COMMA");
    expect(tokens[23].content).toBe(",");
    expect(tokens[24].type).toBe("WHITESPACE");
    expect(tokens[24].content).toBe(" ");
    expect(tokens[25].type).toBe("VARIABLE_NAMED");
    expect(tokens[25].content).toBe("Y");
    expect(tokens[26].type).toBe("CLOSE_PAREN");
    expect(tokens[26].content).toBe(")");
    expect(tokens[27].type).toBe("PERIOD");
    expect(tokens[27].content).toBe(".");
  });

  test("lexes logical operators", () => {
    const input = "~foo(X) & bar(Y)";
    const tokens = rulesetLexer(input);
    validateTokenBoundaries(input, tokens);

    expect(tokens[0].type).toBe("NEGATION_SYMBOL");
    expect(tokens[0].content).toBe("~");
    expect(tokens[1].type).toBe("CONSTANT");
    expect(tokens[1].content).toBe("foo");
    expect(tokens[2].type).toBe("OPEN_PAREN");
    expect(tokens[2].content).toBe("(");
    expect(tokens[3].type).toBe("VARIABLE_NAMED");
    expect(tokens[3].content).toBe("X");
    expect(tokens[4].type).toBe("CLOSE_PAREN");
    expect(tokens[4].content).toBe(")");
    expect(tokens[5].type).toBe("WHITESPACE");
    expect(tokens[5].content).toBe(" ");
    expect(tokens[6].type).toBe("AMPERSAND");
    expect(tokens[6].content).toBe("&");
    expect(tokens[7].type).toBe("WHITESPACE");
    expect(tokens[7].content).toBe(" ");
    expect(tokens[8].type).toBe("CONSTANT");
    expect(tokens[8].content).toBe("bar");
    expect(tokens[9].type).toBe("OPEN_PAREN");
    expect(tokens[9].content).toBe("(");
    expect(tokens[10].type).toBe("VARIABLE_NAMED");
    expect(tokens[10].content).toBe("Y");
    expect(tokens[11].type).toBe("CLOSE_PAREN");
    expect(tokens[11].content).toBe(")");
  });

  test("lexes definition operators", () => {
    const input = ["foo(X) := bar(X).", "A :: B ==> C."].join("\n");
    const tokens = rulesetLexer(input);
    validateTokenBoundaries(input, tokens);

    expect(tokens[0].type).toBe("CONSTANT");
    expect(tokens[0].content).toBe("foo");
    expect(tokens[1].type).toBe("OPEN_PAREN");
    expect(tokens[1].content).toBe("(");
    expect(tokens[2].type).toBe("VARIABLE_NAMED");
    expect(tokens[2].content).toBe("X");
    expect(tokens[3].type).toBe("CLOSE_PAREN");
    expect(tokens[3].content).toBe(")");
    expect(tokens[4].type).toBe("WHITESPACE");
    expect(tokens[4].content).toBe(" ");
    expect(tokens[5].type).toBe("DEFINITION_SEPARATOR");
    expect(tokens[5].content).toBe(":=");
    expect(tokens[6].type).toBe("WHITESPACE");
    expect(tokens[6].content).toBe(" ");
    expect(tokens[7].type).toBe("CONSTANT");
    expect(tokens[7].content).toBe("bar");
    expect(tokens[8].type).toBe("OPEN_PAREN");
    expect(tokens[8].content).toBe("(");
    expect(tokens[9].type).toBe("VARIABLE_NAMED");
    expect(tokens[9].content).toBe("X");
    expect(tokens[10].type).toBe("CLOSE_PAREN");
    expect(tokens[10].content).toBe(")");
    expect(tokens[11].type).toBe("PERIOD");
    expect(tokens[11].content).toBe(".");
    expect(tokens[12].type).toBe("WHITESPACE");
    expect(tokens[13].type).toBe("VARIABLE_NAMED");
    expect(tokens[13].content).toBe("A");
    expect(tokens[14].type).toBe("WHITESPACE");
    expect(tokens[14].content).toBe(" ");
    expect(tokens[15].type).toBe("DOUBLE_COLON");
    expect(tokens[15].content).toBe("::");
    expect(tokens[16].type).toBe("WHITESPACE");
    expect(tokens[16].content).toBe(" ");
    expect(tokens[17].type).toBe("VARIABLE_NAMED");
    expect(tokens[17].content).toBe("B");
    expect(tokens[18].type).toBe("WHITESPACE");
    expect(tokens[18].content).toBe(" ");
    expect(tokens[19].type).toBe("DOUBLE_ARROW");
    expect(tokens[19].content).toBe("==>");
    expect(tokens[20].type).toBe("WHITESPACE");
    expect(tokens[20].content).toBe(" ");
    expect(tokens[21].type).toBe("VARIABLE_NAMED");
    expect(tokens[21].content).toBe("C");
    expect(tokens[22].type).toBe("PERIOD");
    expect(tokens[22].content).toBe(".");
  });

  test("maintains line count across newlines", () => {
    const input = ["foo(X) :-", "  bar(X) &", "  baz(X)."].join("\n");
    const tokens = rulesetLexer(input);
    validateTokenBoundaries(input, tokens);

    const lastLine = tokens[tokens.length - 1].line;
    expect(lastLine).toBe(3);
  });

  test("handles complex rules with mixed tokens", () => {
    const input = `
      ancestor(X, Y) :-
        parent(X, Y).
      ancestor(X, Y) :-
        parent(X, Z) &
        ancestor(Z, Y).
    `;
    const tokens = rulesetLexer(input);
    validateTokenBoundaries(input, tokens);

    const nonWhitespaceTokens = tokens.filter((t) => t.type !== "WHITESPACE");
    expect(nonWhitespaceTokens.some((t) => t.type === "VARIABLE_NAMED")).toBe(
      true
    );
    expect(
      nonWhitespaceTokens.some((t) => t.type === "RULE_SEPARATOR_NECK")
    ).toBe(true);
    expect(nonWhitespaceTokens.some((t) => t.type === "AMPERSAND")).toBe(true);
  });

  test("correctly identifies errors", () => {
    const input = "@invalid";
    const tokens = rulesetLexer(input);
    validateTokenBoundaries(input, tokens);

    expect(tokens[0].type).toBe("ERROR");
    expect(tokens[0].errorMessage).toBeDefined();
  });
});
