import { describe, expect, it } from "bun:test";
import { createLexerState } from "./_common";
import { handleOperator } from "./operator";

describe("handleOperators", () => {
  it("handles rule separator/neck (:-)", () => {
    const state = createLexerState(":-");
    handleOperator(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "RULE_SEPARATOR_NECK",
      start: 0,
      end: 2,
      line: 1,
      content: ":-",
    });
  });

  it("handles double-colon (::)", () => {
    const state = createLexerState("::");
    handleOperator(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "DOUBLE_COLON",
      start: 0,
      end: 2,
      line: 1,
      content: "::",
    });
  });

  it("handles definition separator (:=)", () => {
    const state = createLexerState(":=");
    handleOperator(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "DEFINITION_SEPARATOR",
      start: 0,
      end: 2,
      line: 1,
      content: ":=",
    });
  });

  it("handles double-arrow (==>)", () => {
    const state = createLexerState("==>");
    handleOperator(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "DOUBLE_ARROW",
      start: 0,
      end: 3,
      line: 1,
      content: "==>",
    });
  });

  it("errors on invalid colon operator", () => {
    const state = createLexerState(":x");
    handleOperator(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "ERROR",
      start: 0,
      end: 1,
      line: 1,
      content: ":",
      errorMessage: "Invalid operator",
    });
  });

  it("errors on incomplete double arrow", () => {
    const state = createLexerState("==");
    handleOperator(state);
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toEqual({
      type: "ERROR",
      start: 0,
      end: 1,
      line: 1,
      content: "=",
      errorMessage: "Invalid operator",
    });
  });
});
