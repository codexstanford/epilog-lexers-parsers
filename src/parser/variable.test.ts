import { describe, expect, it } from "bun:test";
import { rulesetLexer } from "../ruleset-lexer";
import type { RulesetParserObject } from "../types";
import { createParserState } from "./_control-flow";
import { parseVariable } from "./variable";

describe("parseVariable", () => {
  it("should parse a named variable", () => {
    const state = createParserState(rulesetLexer("X"), "DATASET");

    const [result, newState] = parseVariable(state);

    expect(result).toEqual({
      type: "VARIABLE",
      start: 0,
      end: 1,
      line: 1,
      content: "X",
      children: [
        { type: "VARIABLE_NAMED", start: 0, end: 1, line: 1, content: "X" },
      ],
    } satisfies RulesetParserObject);

    expect(newState.current).toBe(1);
  });

  it("should parse an anonymous variable", () => {
    const state = createParserState(rulesetLexer("_"), "DATASET");

    const [result, newState] = parseVariable(state);

    expect(result).toEqual({
      type: "VARIABLE",
      start: 0,
      end: 1,
      line: 1,
      content: "_",
      children: [
        { type: "VARIABLE_ANONYMOUS", start: 0, end: 1, line: 1, content: "_" },
      ],
    } satisfies RulesetParserObject);

    expect(newState.current).toBe(1);
  });

  it("should return null for invalid input", () => {
    const state = createParserState(rulesetLexer("x"), "DATASET");

    const [result, newState] = parseVariable(state);

    expect(result).toBeNull();
    expect(newState).toBe(state);
  });
});
