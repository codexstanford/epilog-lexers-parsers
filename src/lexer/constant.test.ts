import { describe, expect, it } from "bun:test";
import { createLexerState } from "./_common";
import { handleConstant } from "./constant";

describe("handleConstant", () => {
  it("handles simple constants", () => {
    const state = createLexerState("test");
    handleConstant(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "CONSTANT",
      start: 0,
      end: 4,
      line: 1,
      content: "test",
    });
  });

  it("handles constants with embedded periods", () => {
    const state = createLexerState("test.case");
    handleConstant(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "CONSTANT",
      start: 0,
      end: 9,
      line: 1,
      content: "test.case",
    });
  });

  it("stops at trailing period", () => {
    const state = createLexerState("test.");
    handleConstant(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "CONSTANT",
      start: 0,
      end: 4,
      line: 1,
      content: "test",
    });
  });

  it("handles underscore in middle of constant", () => {
    const state = createLexerState("test_case");
    handleConstant(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "CONSTANT",
      start: 0,
      end: 9,
      line: 1,
      content: "test_case",
    });
  });

  it("errors on underscore at start", () => {
    const state = createLexerState("_test");
    handleConstant(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "ERROR",
      start: 0,
      end: 5,
      line: 1,
      content: "_test",
      errorMessage: "Constants cannot start with underscore",
    });
  });
});
