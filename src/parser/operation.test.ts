import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseOperation } from "./operation";
import { createParserState } from "./_control-flow";
import { rulesetLexer } from "../ruleset-lexer";

describe("parseOperation", () => {
  test("should return an error when parsing operation with nothing after double collon", () => {
    const state: ParserState = createParserState(
      rulesetLexer("move(X,Y)::"),
      "RULESET"
    );

    const [result] = parseOperation(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("ERROR");
    expect(result?.children?.map((c) => c.type)).toEqual([
      "ATOM",
      "DOUBLE_COLON",
      "ERROR",
    ]);
  });

  test("should parse operation with preconditions", () => {
    const state: ParserState = createParserState(
      rulesetLexer("move(X,Y):: valid(X) & empty(Y)"),
      "RULESET"
    );

    const [result] = parseOperation(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("OPERATION");
    expect(result?.children?.map((c) => c.type)).toEqual([
      "ATOM",
      "DOUBLE_COLON",
      "WHITESPACE",
      "LITERAL",
      "WHITESPACE",
      "AMPERSAND",
      "WHITESPACE",
      "LITERAL",
    ]);
  });

  test("should parse operation with pre and postconditions", () => {
    const state: ParserState = createParserState(
      rulesetLexer("move(X,Y):: valid(X) & empty(Y) ==> at(X) & ~at(Y)"),
      "RULESET"
    );

    const [result] = parseOperation(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("OPERATION");
    expect(result?.children?.some((c) => c.type === "DOUBLE_ARROW")).toBe(true);
  });

  test("should parse operation with period", () => {
    const state: ParserState = createParserState(
      rulesetLexer("move(X,Y):: valid(X)."),
      "RULESET"
    );

    const [result] = parseOperation(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("OPERATION");
    expect(result?.children?.at(-1)?.type).toBe("PERIOD");
  });

  test("should handle nested compound terms", () => {
    const state: ParserState = createParserState(
      rulesetLexer("op(f(X)):: pre(g(X,h(Y))) ==> post(k(X))"),
      "RULESET"
    );

    const [result] = parseOperation(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("OPERATION");
  });

  test("should error on incomplete preconditions", () => {
    const state: ParserState = createParserState(
      rulesetLexer("op(X):: pre(X) &"),
      "RULESET"
    );

    const [result] = parseOperation(state);
    expect(result?.type).toBe("ERROR");
    expect(result?.errorMessage).toBeDefined();
  });

  test("should error on unfinished operation", () => {
    const state: ParserState = createParserState(
      rulesetLexer("op(A)::"),
      "RULESET"
    );

    const [result] = parseOperation(state);
    expect(result?.type).toBe("ERROR");
    expect(result?.errorMessage).toBeDefined();
  });

  test("should parse operation with negated conditions", () => {
    const state: ParserState = createParserState(
      rulesetLexer("op(X):: p(X) & ~q(X) => r(X)"),
      "RULESET"
    );

    const [result] = parseOperation(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("OPERATION");
    const literals = result?.children?.filter((c) => c.type === "LITERAL");
    expect(literals?.[1].children?.[0].type).toBe("NEGATION_SYMBOL");
  });

  test("should return null for invalid input", () => {
    const state: ParserState = createParserState(rulesetLexer("::"), "RULESET");

    const [result] = parseOperation(state);
    expect(result).toBeNull();
  });
});
