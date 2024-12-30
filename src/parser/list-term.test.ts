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

  test("should handle error for unclosed bracket", () => {
    const state: ParserState = createState(datasetLexer("[x"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });
});
