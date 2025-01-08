import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseLiteral } from "./literal";
import { createParserState } from "./_control-flow";
import { rulesetLexer } from "../ruleset-lexer";

describe("parseLiteral", () => {
  test("should parse simple literal without negation", () => {
    const state: ParserState = createParserState(
      rulesetLexer("human(socrates)"),
      "RULESET"
    );

    const [result] = parseLiteral(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LITERAL");
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0].type).toBe("ATOM");
  });

  test("should parse literal with negation", () => {
    const state: ParserState = createParserState(
      rulesetLexer("~mortal(socrates)"),
      "RULESET"
    );

    const [result] = parseLiteral(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LITERAL");
    expect(result?.children).toHaveLength(2);
    expect(result?.children?.[0].type).toBe("NEGATION_SYMBOL");
    expect(result?.children?.[1].type).toBe("ATOM");
  });

  test("should return error for negation without atom", () => {
    const state: ParserState = createParserState(rulesetLexer("~"), "RULESET");

    const [result] = parseLiteral(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should parse nested compound literal", () => {
    const state: ParserState = createParserState(
      rulesetLexer("~parent(john, child(mary))"),
      "RULESET"
    );

    const [result] = parseLiteral(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LITERAL");
    expect(result?.children).toHaveLength(2);
    expect(result?.children?.[0].type).toBe("NEGATION_SYMBOL");
    expect(result?.children?.[1].type).toBe("ATOM");
  });

  test("should return null for empty input", () => {
    const state: ParserState = createParserState(rulesetLexer(""), "RULESET");

    const [result] = parseLiteral(state);
    expect(result).toBeNull();
  });

  test("should return null for invalid literal", () => {
    const state: ParserState = createParserState(rulesetLexer("42"), "RULESET");

    const [result] = parseLiteral(state);
    expect(result).toBeNull();
  });
});
