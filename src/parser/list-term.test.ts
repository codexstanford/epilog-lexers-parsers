import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseListTerm } from "./list-term";
import { createState } from "./_control-flow";
import { datasetLexer } from "../dataset-lexer";

describe("parseListTerm", () => {
  test("should parse nil constant", () => {
    const state: ParserState = createState(datasetLexer("nil"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("nil");
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0]?.content).toBe("nil");
  });

  test("should parse empty bracketed list", () => {
    const state: ParserState = createState(datasetLexer("[]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[]");
    expect(result?.children).toHaveLength(2);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[0]?.content).toBe("[");
    expect(result?.children?.[1]?.type).toBe("CLOSE_BRACKET");
    expect(result?.children?.[1]?.content).toBe("]");
  });

  test("should parse bracketed list with single term", () => {
    const state: ParserState = createState(datasetLexer("[x]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x]");
    expect(result?.children).toHaveLength(3);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[0]?.content).toBe("[");
    expect(result?.children?.[1]?.type).toBe("CONSTANT_TERM");
    expect(result?.children?.[1]?.content).toBe("x");
    expect(result?.children?.[2]?.type).toBe("CLOSE_BRACKET");
    expect(result?.children?.[2]?.content).toBe("]");
  });

  test("should parse bracketed list with multiple terms", () => {
    const state: ParserState = createState(datasetLexer("[x,y]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x,y]");
    expect(result?.children).toHaveLength(5);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[0]?.content).toBe("[");
    expect(result?.children?.[1]?.type).toBe("CONSTANT_TERM");
    expect(result?.children?.[1]?.content).toBe("x");
    expect(result?.children?.[2]?.type).toBe("COMMA");
    expect(result?.children?.[2]?.content).toBe(",");
    expect(result?.children?.[3]?.type).toBe("CONSTANT_TERM");
    expect(result?.children?.[3]?.content).toBe("y");
    expect(result?.children?.[4]?.type).toBe("CLOSE_BRACKET");
    expect(result?.children?.[4]?.content).toBe("]");
  });

  test("should parse list with whitespace between terms", () => {
    const state: ParserState = createState(datasetLexer("[x , y]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x , y]");
    expect(result?.children).toHaveLength(7);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[0]?.content).toBe("[");
    expect(result?.children?.[1]?.type).toBe("CONSTANT_TERM");
    expect(result?.children?.[1]?.content).toBe("x");
    expect(result?.children?.[2]?.type).toBe("WHITESPACE");
    expect(result?.children?.[2]?.content).toBe(" ");
    expect(result?.children?.[3]?.type).toBe("COMMA");
    expect(result?.children?.[3]?.content).toBe(",");
    expect(result?.children?.[4]?.type).toBe("WHITESPACE");
    expect(result?.children?.[4]?.content).toBe(" ");
    expect(result?.children?.[5]?.type).toBe("CONSTANT_TERM");
    expect(result?.children?.[5]?.content).toBe("y");
    expect(result?.children?.[6]?.type).toBe("CLOSE_BRACKET");
    expect(result?.children?.[6]?.content).toBe("]");
  });

  test("should parse nested list", () => {
    const state: ParserState = createState(datasetLexer("[x,[y]]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x,[y]]");
    expect(result?.children).toHaveLength(5);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[1]?.type).toBe("CONSTANT_TERM");
    expect(result?.children?.[1]?.content).toBe("x");
    expect(result?.children?.[2]?.type).toBe("COMMA");
    expect(result?.children?.[2]?.content).toBe(",");
    expect(result?.children?.[3]?.type).toBe("LIST_TERM");
    expect(result?.children?.[3]?.content).toBe("[y]");
    expect(result?.children?.[4]?.type).toBe("CLOSE_BRACKET");
  });

  test("should handle error for unclosed bracket", () => {
    const state: ParserState = createState(datasetLexer("[x"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for missing comma between elements", () => {
    const state: ParserState = createState(datasetLexer("[x y]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle list with only whitespace", () => {
    const state: ParserState = createState(datasetLexer("[ ]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[ ]");
    expect(result?.children).toHaveLength(3);
    expect(result?.children?.[1]?.type).toBe("WHITESPACE");
  });

  test("should handle error for trailing comma", () => {
    const state: ParserState = createState(datasetLexer("[x,]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for consecutive commas", () => {
    const state: ParserState = createState(datasetLexer("[x,,y]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for invalid term type", () => {
    const state: ParserState = createState(datasetLexer("[?]"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle deeply nested lists", () => {
    const state: ParserState = createState(
      datasetLexer("[[[[[x]]]]]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[[[[[x]]]]]");

    // Check first level
    expect(result?.children).toHaveLength(3);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[1]?.type).toBe("LIST_TERM");
    expect(result?.children?.[2]?.type).toBe("CLOSE_BRACKET");

    // Check second level
    const level2 = result?.children?.[1];
    expect(level2?.children).toHaveLength(3);
    expect(level2?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(level2?.children?.[1]?.type).toBe("LIST_TERM");
    expect(level2?.children?.[2]?.type).toBe("CLOSE_BRACKET");

    // Check third level
    const level3 = level2?.children?.[1];
    expect(level3?.children).toHaveLength(3);
    expect(level3?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(level3?.children?.[1]?.type).toBe("LIST_TERM");
    expect(level3?.children?.[2]?.type).toBe("CLOSE_BRACKET");

    // Check fourth level
    const level4 = level3?.children?.[1];
    expect(level4?.children).toHaveLength(3);
    expect(level4?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(level4?.children?.[1]?.type).toBe("LIST_TERM");
    expect(level4?.children?.[2]?.type).toBe("CLOSE_BRACKET");

    // Check innermost level
    const level5 = level4?.children?.[1];
    expect(level5?.children).toHaveLength(3);
    expect(level5?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(level5?.children?.[1]?.type).toBe("CONSTANT_TERM");
    expect(level5?.children?.[1]?.content).toBe("x");
    expect(level5?.children?.[2]?.type).toBe("CLOSE_BRACKET");
  });

  test("should parse list containing compound term", () => {
    const state: ParserState = createState(
      datasetLexer("[x, f(y), z]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x, f(y), z]");

    // Check compound term in the middle
    const compoundTerm = result?.children?.[4];
    expect(compoundTerm?.type).toBe("COMPOUND_TERM");
    expect(compoundTerm?.content).toBe("f(y)");
    expect(compoundTerm?.children).toHaveLength(4);
    expect(compoundTerm?.children?.[0]?.content).toBe("f");
    expect(compoundTerm?.children?.[2]?.content).toBe("y");
  });
});
