import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseAtom } from "./atom";
import { createParserState } from "./_control-flow";
import { rulesetLexer } from "../ruleset-lexer";

describe("parseAtom", () => {
  test("should parse simple symbol term atom", () => {
    const state: ParserState = createParserState(
      rulesetLexer("mike"),
      "RULESET"
    );

    const [result] = parseAtom(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("ATOM");
    expect(result?.content).toBe("mike");
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0]?.type).toBe("SYMBOL_TERM");
  });

  test("should parse compound atom", () => {
    const state: ParserState = createParserState(
      rulesetLexer("parent(john,mary)"),
      "RULESET"
    );

    const [result] = parseAtom(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("ATOM");
    expect(result?.content).toBe("parent(john,mary)");
    expect(result?.children).toHaveLength(6);
  });

  test("should not parse atom starting with string", () => {
    const state: ParserState = createParserState(
      rulesetLexer('"Hello, World"'),
      "RULESET"
    );

    const [result] = parseAtom(state);
    expect(result).toBeNull();
  });

  test("should not parse atom starting with number", () => {
    const state: ParserState = createParserState(rulesetLexer("42"), "RULESET");

    const [result] = parseAtom(state);
    expect(result).toBeNull();
  });

  test("should return null for empty input", () => {
    const state: ParserState = createParserState(rulesetLexer(""), "RULESET");

    const [result] = parseAtom(state);
    expect(result).toBeNull();
  });

  test("should return null for invalid atom", () => {
    const state: ParserState = createParserState(
      rulesetLexer("?invalid"),
      "RULESET"
    );

    const [result] = parseAtom(state);
    expect(result).toBeNull();
  });

  test("should parse nested compound atom", () => {
    const state: ParserState = createParserState(
      rulesetLexer("grandparent(john, parent(mary))"),
      "RULESET"
    );

    const [result] = parseAtom(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("ATOM");
    expect(result?.children?.[0]?.type).toBe("SYMBOL_TERM");
    expect(result?.children?.[1]?.type).toBe("OPEN_PAREN");
    expect(result?.children?.[2]?.type).toBe("TERM");
    expect(result?.children?.[3]?.type).toBe("COMMA");
    expect(result?.children?.[4]?.type).toBe("WHITESPACE");
    expect(result?.children?.[5]?.type).toBe("TERM");
    expect(result?.children?.[6]?.type).toBe("CLOSE_PAREN");

    const compoundTerm = result?.children?.[5].children?.[0];
    expect(compoundTerm?.children?.[0]?.type).toBe("SYMBOL_TERM");
    expect(compoundTerm?.children?.[1]?.type).toBe("OPEN_PAREN");
    expect(compoundTerm?.children?.[2]?.type).toBe("TERM");
    expect(compoundTerm?.children?.[2]?.children?.[0].type).toBe("SIMPLE_TERM");
    expect(compoundTerm?.children?.[3]?.type).toBe("CLOSE_PAREN");
  });
});
