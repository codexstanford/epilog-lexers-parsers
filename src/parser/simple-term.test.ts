import { describe, expect, it } from "bun:test";
import { datasetLexer } from "../dataset-lexer";
import type { ParserObject } from "../types";
import { createParserState } from "./_control-flow";
import { parseSimpleTerm } from "./simple-term";

describe("parseSimpleTerm", () => {
  it("should parse a constant", () => {
    const state = createParserState(datasetLexer("x"), "DATASET");

    const [result, newState] = parseSimpleTerm(state);

    expect(result).toEqual({
      type: "SIMPLE_TERM",
      start: 0,
      end: 1,
      line: 1,
      content: "x",
      children: [
        { type: "SYMBOL_TERM", start: 0, end: 1, line: 1, content: "x" },
      ],
    } satisfies ParserObject);

    expect(newState.current).toBe(1);
  });

  it("should parse a number", () => {
    const state = createParserState(datasetLexer("42"), "DATASET");

    const [result, newState] = parseSimpleTerm(state);

    expect(result).toEqual({
      type: "SIMPLE_TERM",
      start: 0,
      end: 2,
      line: 1,
      content: "42",
      children: [{ type: "NUMBER", start: 0, end: 2, line: 1, content: "42" }],
    } satisfies ParserObject);

    expect(newState.current).toBe(1);
  });

  it("should parse a string", () => {
    const state = createParserState(datasetLexer('"hello"'), "DATASET");

    const [result, newState] = parseSimpleTerm(state);

    expect(result).toEqual({
      type: "SIMPLE_TERM",
      start: 0,
      end: 7,
      line: 1,
      content: '"hello"',
      children: [
        { type: "STRING", start: 0, end: 7, line: 1, content: '"hello"' },
      ],
    } satisfies ParserObject);

    expect(newState.current).toBe(1);
  });

  it("should return null for invalid input", () => {
    const state = createParserState(datasetLexer("X_invalid"), "DATASET");

    const [result, newState] = parseSimpleTerm(state);

    expect(result).toBeNull();
    expect(newState).toBe(state);
  });
});
