import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseRule } from "./rule";
import { createParserState } from "./_control-flow";
import { rulesetLexer } from "../ruleset-lexer";

describe("parseRule", () => {
  test("should parse simple rule (just an atom)", () => {
    const state: ParserState = createParserState(
      rulesetLexer("human(socrates)"),
      "RULESET"
    );

    const [result] = parseRule(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("RULE");
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0].type).toBe("ATOM");
  });

  test("should parse rule with neck and single literal", () => {
    const state: ParserState = createParserState(
      rulesetLexer("mortal(X) :- human(X)"),
      "RULESET"
    );

    const [result] = parseRule(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("RULE");
    expect(result?.children).toHaveLength(5); // atom, whitespace, neck, whitespace, literal
    expect(result?.children?.[0].type).toBe("ATOM");
    expect(result?.children?.[1].type).toBe("WHITESPACE");
    expect(result?.children?.[2].type).toBe("RULE_SEPARATOR_NECK");
    expect(result?.children?.[3].type).toBe("WHITESPACE");
    expect(result?.children?.[4].type).toBe("LITERAL");
  });

  test("should parse rule with multiple literals", () => {
    const state: ParserState = createParserState(
      rulesetLexer("grandparent(X,Y) :- parent(X,Z) & parent(Z,Y)"),
      "RULESET"
    );

    const [result] = parseRule(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("RULE");
    expect(result?.children?.map((c) => c.type)).toEqual([
      "ATOM",
      "WHITESPACE",
      "RULE_SEPARATOR_NECK",
      "WHITESPACE",
      "LITERAL",
      "WHITESPACE",
      "AMPERSAND",
      "WHITESPACE",
      "LITERAL",
    ]);
  });

  test("should parse rule with period", () => {
    const state: ParserState = createParserState(
      rulesetLexer("mortal(socrates)."),
      "RULESET"
    );

    const [result] = parseRule(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("RULE");
    expect(result?.children).toHaveLength(2);
    expect(result?.children?.[0].type).toBe("ATOM");
    expect(result?.children?.[1].type).toBe("PERIOD");
  });

  test("should handle nested compound terms in literals", () => {
    const state: ParserState = createParserState(
      rulesetLexer("p(X) :- q(f(X)) & r(g(X,h(Y)))"),
      "RULESET"
    );

    const [result] = parseRule(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("RULE");
    expect(result?.children?.map((c) => c.type)).toEqual([
      "ATOM",
      "WHITESPACE",
      "RULE_SEPARATOR_NECK",
      "WHITESPACE",
      "LITERAL",
      "WHITESPACE",
      "AMPERSAND",
      "WHITESPACE",
      "LITERAL",
    ]);
  });

  test("should error on incomplete rule body", () => {
    const state: ParserState = createParserState(
      rulesetLexer("p(X) :- q(X) &"),
      "RULESET"
    );

    const [result] = parseRule(state);
    expect(result?.type).toBe("ERROR");
    expect(result?.children?.at(-1)?.type).toBe("ERROR");
  });

  test("should parse rule with negated literal", () => {
    const state: ParserState = createParserState(
      rulesetLexer("p(X) :- q(X) & ~r(X)"),
      "RULESET"
    );

    const [result] = parseRule(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("RULE");
    const literals = result?.children?.filter((c) => c.type === "LITERAL");
    expect(literals).toHaveLength(2);
    expect(literals?.[1].children?.[0].type).toBe("NEGATION_SYMBOL");
  });

  test("should return null for invalid input", () => {
    const state: ParserState = createParserState(rulesetLexer(":-"), "RULESET");

    const [result] = parseRule(state);
    expect(result).toBeNull();
  });

  test("should parse only the first rule when two consecutive horn clauses are provided without separating whitespace or period", () => {
    const state: ParserState = createParserState(
      rulesetLexer("p(X) :- q(X)r(Y) :- s(Y)"),
      "RULESET"
    );

    const [result] = parseRule(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("RULE");
    expect(result?.children?.map((c) => c.type)).toEqual([
      "ATOM",
      "WHITESPACE",
      "RULE_SEPARATOR_NECK",
      "WHITESPACE",
      "LITERAL",
    ]);
  });
});
