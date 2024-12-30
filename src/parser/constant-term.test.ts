import { describe, expect, it } from "bun:test";
import { datasetLexer } from "../dataset-lexer";
import type { RulesetParserObject } from "../types";
import { createParserState } from "./_control-flow";
import { parseConstantTerm } from "./constant-term";

describe("parseConstantTerm", () => {
  it("should parse a constant", () => {
    const state = createParserState(datasetLexer("x"), "DATASET");

    const [result, newState] = parseConstantTerm(state);

    expect(result).toEqual({
      type: "CONSTANT_TERM",
      start: 0,
      end: 1,
      line: 1,
      content: "x",
      children: [{ type: "CONSTANT", start: 0, end: 1, line: 1, content: "x" }],
    } satisfies RulesetParserObject);

    expect(newState.current).toBe(1);
  });

  it("should parse a number", () => {
    const state = createParserState(datasetLexer("42"), "DATASET");

    const [result, newState] = parseConstantTerm(state);

    expect(result).toEqual({
      type: "CONSTANT_TERM",
      start: 0,
      end: 2,
      line: 1,
      content: "42",
      children: [{ type: "NUMBER", start: 0, end: 2, line: 1, content: "42" }],
    } satisfies RulesetParserObject);

    expect(newState.current).toBe(1);
  });

  it("should parse a string", () => {
    const state = createParserState(datasetLexer('"hello"'), "DATASET");

    const [result, newState] = parseConstantTerm(state);

    expect(result).toEqual({
      type: "CONSTANT_TERM",
      start: 0,
      end: 7,
      line: 1,
      content: '"hello"',
      children: [
        { type: "STRING", start: 0, end: 7, line: 1, content: '"hello"' },
      ],
    } satisfies RulesetParserObject);

    expect(newState.current).toBe(1);
  });

  it("should return null for invalid input", () => {
    const state = createParserState(datasetLexer("X_invalid"), "DATASET");

    const [result, newState] = parseConstantTerm(state);

    expect(result).toBeNull();
    expect(newState).toBe(state);
  });
});
