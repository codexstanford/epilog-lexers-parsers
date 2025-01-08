import { describe, expect, it } from "bun:test";
import { createLexerState } from "./_common";
import { handleVariable } from "./variable";

describe("handleVariable", () => {
  it("handles simple named variables", () => {
    const state = createLexerState("Xyz");
    handleVariable(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "VARIABLE_NAMED",
      start: 0,
      end: 3,
      line: 1,
      content: "Xyz",
    });
  });

  it("handles named variables with numbers and underscores", () => {
    const state = createLexerState("X123_abc");
    handleVariable(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "VARIABLE_NAMED",
      start: 0,
      end: 8,
      line: 1,
      content: "X123_abc",
    });
  });

  it("handles anonymous variable", () => {
    const state = createLexerState("_");
    handleVariable(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "VARIABLE_ANONYMOUS",
      start: 0,
      end: 1,
      line: 1,
      content: "_",
    });
  });

  it("handles named variable starting with underscore", () => {
    const state = createLexerState("_Var");
    handleVariable(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "VARIABLE_NAMED",
      start: 0,
      end: 4,
      line: 1,
      content: "_Var",
    });
  });

  it("stops at non-variable characters", () => {
    const state = createLexerState("Abc!");
    handleVariable(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "VARIABLE_NAMED",
      start: 0,
      end: 3,
      line: 1,
      content: "Abc",
    });
  });
});
