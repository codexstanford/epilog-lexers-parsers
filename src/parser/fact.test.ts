import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseFact } from "./fact";
import { createState } from "./_control-flow";
import { datasetLexer } from "../dataset-lexer";

describe("parseFact", () => {
  test("should parse simple constant fact", () => {
    const state: ParserState = createState(datasetLexer("true."), "DATASET");
    const [result] = parseFact(state);

    console.log(result);

    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.content).toBe("true.");
    expect(result?.children).toHaveLength(2);
    expect(result?.children?.[0]?.type).toBe("CONSTANT");
    expect(result?.children?.[1]?.type).toBe("PERIOD");
  });

  test("should parse compound fact", () => {
    const state: ParserState = createState(
      datasetLexer("parent(john,mary)."),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.content).toBe("parent(john,mary).");
    expect(result?.children).toHaveLength(2);
    expect(result?.children?.[0]?.type).toBe("COMPOUND_TERM");
    expect(result?.children?.[1]?.type).toBe("PERIOD");
  });

  test("should parse fact with string", () => {
    const state: ParserState = createState(
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
    const state: ParserState = createState(datasetLexer("42."), "DATASET");

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.children?.[0]?.type).toBe("NUMBER");
    expect(result?.children?.[1]?.type).toBe("PERIOD");
  });

  test("should parse fact without period", () => {
    const state: ParserState = createState(
      datasetLexer("likes(alice,bob)"),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0]?.type).toBe("COMPOUND_TERM");
  });

  test("should parse fact with whitespace", () => {
    const state: ParserState = createState(
      datasetLexer("likes(alice, bob) ."),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.children).toHaveLength(3);
    expect(result?.children?.[1]?.type).toBe("WHITESPACE");
  });

  test("should return null for empty input", () => {
    const state: ParserState = createState(datasetLexer(""), "DATASET");

    const [result] = parseFact(state);
    expect(result).toBeNull();
  });

  test("should return null for invalid fact", () => {
    const state: ParserState = createState(datasetLexer("?invalid"), "DATASET");

    const [result] = parseFact(state);
    expect(result).toBeNull();
  });

  test("should parse nested compound fact", () => {
    const state: ParserState = createState(
      datasetLexer("grandparent(john, parent(mary))."),
      "DATASET"
    );

    const [result] = parseFact(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("FACT");
    expect(result?.children?.[0]?.type).toBe("COMPOUND_TERM");
    const compoundTerm = result?.children?.[0];
    expect(compoundTerm?.children?.[2]?.type).toBe("CONSTANT_TERM");
    expect(compoundTerm?.children?.[4]?.type).toBe("COMPOUND_TERM");
  });
});
