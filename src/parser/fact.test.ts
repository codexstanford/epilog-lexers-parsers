import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseFact } from "./fact";
import { createParserState } from "./_control-flow";
import { datasetLexer } from "../dataset-lexer";

describe("parseFact", () => {
  test("should parse simple constant fact", () => {
    const state: ParserState = createParserState(
      datasetLexer("mike."),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.content).toBe("mike.");
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0]?.type).toBe("CONSTANT");
  });

  test("should parse compound fact", () => {
    const state: ParserState = createParserState(
      datasetLexer("parent(john,mary)."),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.content).toBe("parent(john,mary).");
    expect(result?.children).toHaveLength(7);
  });

  test("should parse fact with string", () => {
    const state: ParserState = createParserState(
      datasetLexer('"Hello, World".'),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.children?.[0]?.type).toBe("STRING");
    expect(result?.children?.[1]?.type).toBe("PERIOD");
  });

  test("should parse fact with number", () => {
    const state: ParserState = createParserState(
      datasetLexer("42."),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.children?.[0]?.type).toBe("NUMBER");
    expect(result?.children?.[1]?.type).toBe("PERIOD");
  });

  test("should parse fact without period", () => {
    const state: ParserState = createParserState(
      datasetLexer("likes(alice,bob)"),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.children).toHaveLength(6);
  });

  /*   test("should parse fact with whitespace", () => {
    const state: ParserState = createParserState(
      datasetLexer("likes(alice, bob) ."),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.children).toHaveLength(9);
    expect(result?.children?.[0]?.type).toBe("CONSTANT");
    expect(result?.children?.[result.children.length - 2]?.type).toBe(
      "WHITESPACE"
    );
    expect(result?.children?.[result.children.length - 1]?.type).toBe("PERIOD");
  }); */

  test("should return null for empty input", () => {
    const state: ParserState = createParserState(datasetLexer(""), "DATASET");

    const [result] = parseFact(state);
    expect(result).toBeNull();
  });

  test("should return null for invalid fact", () => {
    const state: ParserState = createParserState(
      datasetLexer("?invalid"),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).toBeNull();
  });

  test("should parse nested compound fact", () => {
    const state: ParserState = createParserState(
      datasetLexer("grandparent(john, parent(mary))."),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.children?.[0]?.type).toBe("CONSTANT");
    expect(result?.children?.[1]?.type).toBe("OPEN_PAREN");
    expect(result?.children?.[2]?.type).toBe("TERM");
    expect(result?.children?.[3]?.type).toBe("COMMA");
    expect(result?.children?.[4]?.type).toBe("WHITESPACE");
    expect(result?.children?.[5]?.type).toBe("TERM");
    expect(result?.children?.[6]?.type).toBe("CLOSE_PAREN");
    expect(result?.children?.[7]?.type).toBe("PERIOD");

    const compoundTerm = result?.children?.[5].children?.[0];
    expect(compoundTerm?.children?.[0]?.type).toBe("CONSTANT");
    expect(compoundTerm?.children?.[1]?.type).toBe("OPEN_PAREN");
    expect(compoundTerm?.children?.[2]?.type).toBe("TERM");
    expect(compoundTerm?.children?.[2]?.children?.[0].type).toBe(
      "CONSTANT_TERM"
    );
    expect(compoundTerm?.children?.[3]?.type).toBe("CLOSE_PAREN");
  });
});
