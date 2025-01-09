import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseDefinition } from "./definition";
import { createParserState } from "./_control-flow";
import { rulesetLexer } from "../ruleset-lexer";

describe("parseDefinition", () => {
  test("should parse basic definition and stop after term after separator", () => {
    const state: ParserState = createParserState(
      rulesetLexer("father(john,mary) := parent(john,mary) & male(john)"),
      "RULESET"
    );

    const [result] = parseDefinition(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("DEFINITION");
    expect(result?.children?.map((c) => c.type)).toEqual([
      "TERM",
      "WHITESPACE",
      "DEFINITION_SEPARATOR",
      "WHITESPACE",
      "TERM",
    ]);
  });

  test("should parse definition with period", () => {
    const state: ParserState = createParserState(
      rulesetLexer("p(X) := q(X)."),
      "RULESET"
    );

    const [result] = parseDefinition(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("DEFINITION");
    expect(result?.children?.at(-1)?.type).toBe("PERIOD");
  });

  test("should handle nested compound terms", () => {
    const state: ParserState = createParserState(
      rulesetLexer("f(g(X)) := h(k(X,Y))"),
      "RULESET"
    );

    const [result] = parseDefinition(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("DEFINITION");
  });

  test("should return error for incomplete definition", () => {
    const state: ParserState = createParserState(
      rulesetLexer("p(X) :="),
      "RULESET"
    );

    const [result] = parseDefinition(state);
    expect(result?.type).toBe("ERROR");
    expect(result?.errorMessage).toBeDefined();
  });

  test("should return null for invalid input", () => {
    const state: ParserState = createParserState(rulesetLexer(":="), "RULESET");

    const [result] = parseDefinition(state);
    expect(result).toBeNull();
  });

  test("should parse definition with multiple nested terms", () => {
    const state: ParserState = createParserState(
      rulesetLexer("complex(f(X,g(Y))) := result(h(X,k(Y,Z)))"),
      "RULESET"
    );

    const [result] = parseDefinition(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("DEFINITION");
  });

  test("should handle whitespace and comments", () => {
    const state: ParserState = createParserState(
      rulesetLexer("p(X) \n% Comment\n := q(X)"),
      "RULESET"
    );

    const [result] = parseDefinition(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("DEFINITION");
    expect(result?.children?.some((c) => c.type === "COMMENT")).toBe(true);
  });
});
