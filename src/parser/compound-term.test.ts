import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseCompoundTerm } from "./compound-term";
import { createParserState } from "./_control-flow";
import { datasetLexer } from "../dataset-lexer";

describe("parseCompoundTerm", () => {
  test("should parse compound term with single argument", () => {
    const state: ParserState = createParserState(
      datasetLexer("f(x)"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("f(x)");
    expect(result?.children).toHaveLength(4);
    expect(result?.children?.[0]?.type).toBe("CONSTANT");
    expect(result?.children?.[0]?.content).toBe("f");
    expect(result?.children?.[1]?.type).toBe("OPEN_PAREN");
    expect(result?.children?.[2]?.type).toBe("TERM");
    expect(result?.children?.[2]?.content).toBe("x");
    expect(result?.children?.[2]?.children?.[0].type).toBe("CONSTANT_TERM");
    expect(result?.children?.[2]?.children?.[0].content).toBe("x");
    expect(result?.children?.[3]?.type).toBe("CLOSE_PAREN");
  });

  test("should parse compound term with multiple arguments", () => {
    const state: ParserState = createParserState(
      datasetLexer("pred(x,y)"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("pred(x,y)");
    expect(result?.children).toHaveLength(6);
    expect(result?.children?.[0]?.type).toBe("CONSTANT");
    expect(result?.children?.[1]?.type).toBe("OPEN_PAREN");
    expect(result?.children?.[2]?.type).toBe("TERM");
    expect(result?.children?.[2]?.children?.[0].type).toBe("CONSTANT_TERM");
    expect(result?.children?.[2]?.children?.[0].content).toBe("x");
    expect(result?.children?.[3]?.type).toBe("COMMA");
    expect(result?.children?.[4]?.type).toBe("TERM");
    expect(result?.children?.[4]?.children?.[0].type).toBe("CONSTANT_TERM");
    expect(result?.children?.[4]?.children?.[0].content).toBe("y");
    expect(result?.children?.[5]?.type).toBe("CLOSE_PAREN");
  });

  test("should parse nested compound terms", () => {
    const state: ParserState = createParserState(
      datasetLexer("f(g(x))"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("f(g(x))");
    expect(result?.children).toHaveLength(4);
    expect(result?.children?.[2]?.type).toBe("TERM");
    expect(result?.children?.[2]?.children?.[0].type).toBe("COMPOUND_TERM");
    expect(result?.children?.[2]?.children?.[0].content).toBe("g(x)");
  });

  test("should handle whitespace between arguments", () => {
    const state: ParserState = createParserState(
      datasetLexer("f( x , y )"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("f( x , y )");
    expect(result?.children?.[2]?.type).toBe("WHITESPACE");
    expect(result?.children?.[4]?.type).toBe("WHITESPACE");
  });

  test("should handle error for unclosed parenthesis", () => {
    const state: ParserState = createParserState(
      datasetLexer("f(x"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for missing comma between arguments", () => {
    const state: ParserState = createParserState(
      datasetLexer("f(x y)"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for trailing comma", () => {
    const state: ParserState = createParserState(
      datasetLexer("f(x,)"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for consecutive commas", () => {
    const state: ParserState = createParserState(
      datasetLexer("f(x,,y)"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should not parse bare constant without parentheses", () => {
    const state: ParserState = createParserState(datasetLexer("f"), "DATASET");

    const [result] = parseCompoundTerm(state);
    expect(result).toBeNull();
  });

  test("should handle error for invalid term type", () => {
    const state: ParserState = createParserState(
      datasetLexer("f(?)"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should parse deeply nested compound terms", () => {
    const state: ParserState = createParserState(
      datasetLexer("f(g(h(i(x))))"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("f(g(h(i(x))))");

    // Check first level
    expect(result?.children).toHaveLength(4);
    expect(result?.children?.[2]?.type).toBe("TERM");
    const level2 = result?.children?.[2]?.children?.[0];
    expect(level2?.type).toBe("COMPOUND_TERM");

    // Check second level
    expect(level2?.children?.[2]?.type).toBe("TERM");
    const level3 = level2?.children?.[2]?.children?.[0];
    expect(level3?.type).toBe("COMPOUND_TERM");

    // Check third level
    expect(level3?.children?.[2]?.type).toBe("TERM");
    const level4 = level3?.children?.[2]?.children?.[0];
    expect(level4?.type).toBe("COMPOUND_TERM");

    // Check innermost level
    expect(level4?.children?.[2]?.type).toBe("TERM");
    const level5 = level4?.children?.[2]?.children?.[0];
    expect(level5?.type).toBe("CONSTANT_TERM");
    expect(level5?.content).toBe("x");
  });

  test("should parse compound term containing list", () => {
    const state: ParserState = createParserState(
      datasetLexer("f(x, [y,z], w)"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("f(x, [y,z], w)");

    // Check list in the middle
    const middleArg = result?.children?.[5];
    expect(middleArg?.type).toBe("TERM");
    expect(middleArg?.children?.[0].type).toBe("LIST_TERM");
    expect(middleArg?.children?.[0].content).toBe("[y,z]");
    expect(middleArg?.children?.[0].children).toHaveLength(5);
    expect(middleArg?.children?.[0].children?.[1]?.type).toBe("TERM");
    expect(middleArg?.children?.[0].children?.[1]?.children?.[0].content).toBe(
      "y"
    );
    expect(middleArg?.children?.[0].children?.[3]?.type).toBe("TERM");
    expect(middleArg?.children?.[0].children?.[3]?.children?.[0].content).toBe(
      "z"
    );
  });
});
