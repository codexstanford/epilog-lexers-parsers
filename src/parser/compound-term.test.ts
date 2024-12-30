import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseCompoundTerm } from "./compound-term";
import { createState } from "./_control-flow";
import { datasetLexer } from "../dataset-lexer";

describe("parseCompoundTerm", () => {
  test("should parse compound term with single argument", () => {
    const state: ParserState = createState(datasetLexer("f(x)"), "DATASET");

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("f(x)");
    expect(result?.children).toHaveLength(4);
    expect(result?.children?.[0]?.type).toBe("CONSTANT");
    expect(result?.children?.[0]?.content).toBe("f");
    expect(result?.children?.[1]?.type).toBe("OPEN_PAREN");
    expect(result?.children?.[2]?.type).toBe("CONSTANT_TERM");
    expect(result?.children?.[2]?.content).toBe("x");
    expect(result?.children?.[3]?.type).toBe("CLOSE_PAREN");
  });

  test("should parse compound term with multiple arguments", () => {
    const state: ParserState = createState(
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
    expect(result?.children?.[2]?.type).toBe("CONSTANT_TERM");
    expect(result?.children?.[3]?.type).toBe("COMMA");
    expect(result?.children?.[4]?.type).toBe("CONSTANT_TERM");
    expect(result?.children?.[5]?.type).toBe("CLOSE_PAREN");
  });

  test("should parse nested compound terms", () => {
    const state: ParserState = createState(datasetLexer("f(g(x))"), "DATASET");

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("f(g(x))");
    expect(result?.children).toHaveLength(4);
    expect(result?.children?.[2]?.type).toBe("COMPOUND_TERM");
    expect(result?.children?.[2]?.content).toBe("g(x)");
  });

  test("should handle whitespace between arguments", () => {
    const state: ParserState = createState(
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
    const state: ParserState = createState(datasetLexer("f(x"), "DATASET");

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for missing comma between arguments", () => {
    const state: ParserState = createState(datasetLexer("f(x y)"), "DATASET");

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for trailing comma", () => {
    const state: ParserState = createState(datasetLexer("f(x,)"), "DATASET");

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for consecutive commas", () => {
    const state: ParserState = createState(datasetLexer("f(x,,y)"), "DATASET");

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should not parse bare constant without parentheses", () => {
    const state: ParserState = createState(datasetLexer("f"), "DATASET");

    const [result] = parseCompoundTerm(state);
    expect(result).toBeNull();
  });

  test("should handle error for invalid term type", () => {
    const state: ParserState = createState(datasetLexer("f(?)"), "DATASET");

    const [result] = parseCompoundTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should parse deeply nested compound terms", () => {
    const state: ParserState = createState(
      datasetLexer("f(g(h(i(x))))"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("f(g(h(i(x))))");

    // Check first level
    expect(result?.children).toHaveLength(4);
    const level2 = result?.children?.[2];
    expect(level2?.type).toBe("COMPOUND_TERM");

    // Check second level
    const level3 = level2?.children?.[2];
    expect(level3?.type).toBe("COMPOUND_TERM");

    // Check third level
    const level4 = level3?.children?.[2];
    expect(level4?.type).toBe("COMPOUND_TERM");

    // Check innermost level
    const level5 = level4?.children?.[2];
    expect(level5?.type).toBe("CONSTANT_TERM");
    expect(level5?.content).toBe("x");
  });

  test("should parse compound term containing list", () => {
    const state: ParserState = createState(
      datasetLexer("f(x, [y,z], w)"),
      "DATASET"
    );

    const [result] = parseCompoundTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("COMPOUND_TERM");
    expect(result?.content).toBe("f(x, [y,z], w)");

    // Check list in the middle
    const listTerm = result?.children?.[5];
    expect(listTerm?.type).toBe("LIST_TERM");
    expect(listTerm?.content).toBe("[y,z]");
    expect(listTerm?.children).toHaveLength(5);
    expect(listTerm?.children?.[1]?.content).toBe("y");
    expect(listTerm?.children?.[3]?.content).toBe("z");
  });
});
