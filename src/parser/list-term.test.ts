import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseListTerm } from "./list-term";
import { createParserState } from "./_control-flow";
import { datasetLexer } from "../dataset-lexer";
import { rulesetLexer } from "../ruleset-lexer";

describe("parseListTerm", () => {
  test("should parse nil constant", () => {
    const state: ParserState = createParserState(
      datasetLexer("nil"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("nil");
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0]?.type).toBe("NIL");
    expect(result?.children?.[0]?.content).toBe("nil");
  });

  test("should parse empty bracketed list", () => {
    const state: ParserState = createParserState(datasetLexer("[]"), "DATASET");

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
    const state: ParserState = createParserState(
      datasetLexer("[x]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x]");
    expect(result?.children).toHaveLength(3);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[0]?.content).toBe("[");
    expect(result?.children?.[1]?.type).toBe("TERM");
    expect(result?.children?.[1]?.content).toBe("x");
    expect(result?.children?.[1]?.children?.[0].type).toBe("SIMPLE_TERM");
    expect(result?.children?.[1]?.children?.[0].content).toBe("x");
    expect(result?.children?.[2]?.type).toBe("CLOSE_BRACKET");
    expect(result?.children?.[2]?.content).toBe("]");
  });

  test("should parse bracketed list with multiple terms", () => {
    const state: ParserState = createParserState(
      datasetLexer("[x,y]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x,y]");
    expect(result?.children).toHaveLength(5);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[0]?.content).toBe("[");
    expect(result?.children?.[1]?.type).toBe("TERM");
    expect(result?.children?.[1]?.content).toBe("x");
    expect(result?.children?.[1]?.children?.[0].type).toBe("SIMPLE_TERM");
    expect(result?.children?.[1]?.children?.[0].content).toBe("x");
    expect(result?.children?.[2]?.type).toBe("COMMA");
    expect(result?.children?.[2]?.content).toBe(",");
    expect(result?.children?.[3]?.type).toBe("TERM");
    expect(result?.children?.[3]?.content).toBe("y");
    expect(result?.children?.[3]?.children?.[0].type).toBe("SIMPLE_TERM");
    expect(result?.children?.[3]?.children?.[0].content).toBe("y");
    expect(result?.children?.[4]?.type).toBe("CLOSE_BRACKET");
    expect(result?.children?.[4]?.content).toBe("]");
  });

  test("should parse list with whitespace between terms", () => {
    const state: ParserState = createParserState(
      datasetLexer("[x , y]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x , y]");
    expect(result?.children).toHaveLength(7);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[0]?.content).toBe("[");
    expect(result?.children?.[1]?.type).toBe("TERM");
    expect(result?.children?.[1]?.children?.[0].type).toBe("SIMPLE_TERM");
    expect(result?.children?.[1]?.children?.[0].content).toBe("x");
    expect(result?.children?.[2]?.type).toBe("WHITESPACE");
    expect(result?.children?.[2]?.content).toBe(" ");
    expect(result?.children?.[3]?.type).toBe("COMMA");
    expect(result?.children?.[3]?.content).toBe(",");
    expect(result?.children?.[4]?.type).toBe("WHITESPACE");
    expect(result?.children?.[4]?.content).toBe(" ");
    expect(result?.children?.[5]?.type).toBe("TERM");
    expect(result?.children?.[5]?.children?.[0].type).toBe("SIMPLE_TERM");
    expect(result?.children?.[5]?.children?.[0].content).toBe("y");
    expect(result?.children?.[6]?.type).toBe("CLOSE_BRACKET");
    expect(result?.children?.[6]?.content).toBe("]");
  });

  test("should parse nested list", () => {
    const state: ParserState = createParserState(
      datasetLexer("[x,[y]]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x,[y]]");
    expect(result?.children).toHaveLength(5);
    expect(result?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(result?.children?.[1]?.type).toBe("TERM");
    expect(result?.children?.[1]?.children?.[0].type).toBe("SIMPLE_TERM");
    expect(result?.children?.[1]?.children?.[0].content).toBe("x");
    expect(result?.children?.[2]?.type).toBe("COMMA");
    expect(result?.children?.[2]?.content).toBe(",");
    expect(result?.children?.[3]?.type).toBe("TERM");
    expect(result?.children?.[3]?.children?.[0].type).toBe("LIST_TERM");
    expect(result?.children?.[3]?.children?.[0].content).toBe("[y]");
    expect(result?.children?.[4]?.type).toBe("CLOSE_BRACKET");
  });

  test("should handle error for unclosed bracket", () => {
    const state: ParserState = createParserState(datasetLexer("[x"), "DATASET");

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for missing comma between elements", () => {
    const state: ParserState = createParserState(
      datasetLexer("[x y]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle list with only whitespace", () => {
    const state: ParserState = createParserState(
      datasetLexer("[ ]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[ ]");
    expect(result?.children).toHaveLength(3);
    expect(result?.children?.[1]?.type).toBe("WHITESPACE");
  });

  test("should handle error for trailing comma", () => {
    const state: ParserState = createParserState(
      datasetLexer("[x,]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for consecutive commas", () => {
    const state: ParserState = createParserState(
      datasetLexer("[x,,y]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle error for invalid term type", () => {
    const state: ParserState = createParserState(
      datasetLexer("[?]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });

  test("should handle deeply nested lists", () => {
    const state: ParserState = createParserState(
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
    expect(result?.children?.[1]?.type).toBe("TERM");
    expect(result?.children?.[1]?.children?.[0].type).toBe("LIST_TERM");
    expect(result?.children?.[2]?.type).toBe("CLOSE_BRACKET");

    // Check second level
    const level2 = result?.children?.[1]?.children?.[0];
    expect(level2?.children).toHaveLength(3);
    expect(level2?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(level2?.children?.[1]?.type).toBe("TERM");
    expect(level2?.children?.[1]?.children?.[0].type).toBe("LIST_TERM");
    expect(level2?.children?.[2]?.type).toBe("CLOSE_BRACKET");

    // Check third level
    const level3 = level2?.children?.[1]?.children?.[0];
    expect(level3?.children).toHaveLength(3);
    expect(level3?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(level3?.children?.[1]?.type).toBe("TERM");
    expect(level3?.children?.[1]?.children?.[0].type).toBe("LIST_TERM");
    expect(level3?.children?.[2]?.type).toBe("CLOSE_BRACKET");

    // Check fourth level
    const level4 = level3?.children?.[1]?.children?.[0];
    expect(level4?.children).toHaveLength(3);
    expect(level4?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(level4?.children?.[1]?.type).toBe("TERM");
    expect(level4?.children?.[1]?.children?.[0].type).toBe("LIST_TERM");
    expect(level4?.children?.[2]?.type).toBe("CLOSE_BRACKET");

    // Check innermost level
    const level5 = level4?.children?.[1]?.children?.[0];
    expect(level5?.children).toHaveLength(3);
    expect(level5?.children?.[0]?.type).toBe("OPEN_BRACKET");
    expect(level5?.children?.[1]?.type).toBe("TERM");
    expect(level5?.children?.[1]?.children?.[0].type).toBe("SIMPLE_TERM");
    expect(level5?.children?.[1]?.children?.[0].content).toBe("x");
    expect(level5?.children?.[2]?.type).toBe("CLOSE_BRACKET");
  });

  test("should parse list containing compound term", () => {
    const state: ParserState = createParserState(
      datasetLexer("[x, f(y), z]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[x, f(y), z]");

    // Check compound term in the middle
    const middleTerm = result?.children?.[4];
    expect(middleTerm?.type).toBe("TERM");
    expect(middleTerm?.children?.[0].type).toBe("COMPOUND_TERM");
    expect(middleTerm?.children?.[0].content).toBe("f(y)");
    expect(middleTerm?.children?.[0].children).toHaveLength(4);
    expect(middleTerm?.children?.[0].children?.[0]?.content).toBe("f");
    expect(middleTerm?.children?.[0].children?.[2]?.content).toBe("y");
  });

  test("should parse multi-line list", () => {
    const state: ParserState = createParserState(
      datasetLexer("[\n  x,\n  y,\n  z\n]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);

    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[\n  x,\n  y,\n  z\n]");
    expect(result?.line).toBe(1);
    expect(result?.endLine).toBe(5);

    // Verify children are on correct lines
    expect(result?.children?.[0]?.line).toBe(1); // [
    expect(result?.children?.[2]?.line).toBe(2); // x
    expect(result?.children?.[6]?.line).toBe(3); // y
    expect(result?.children?.[10]?.line).toBe(4); // z
    expect(result?.children?.[13]?.line).toBe(5); // ]
  });

  test("should parse multi-line list with comments", () => {
    const state: ParserState = createParserState(
      datasetLexer("[a,\n% comment\nb %comment\n,c]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);

    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[a,\n% comment\nb %comment\n,c]");
    expect(result?.line).toBe(1);
    expect(result?.endLine).toBe(4);

    // Verify comments are preserved and on correct lines
    const children = result?.children;
    expect(
      children?.some(
        (child) =>
          child.type === "COMMENT" &&
          child.line === 2 &&
          child.content === "% comment"
      )
    ).toBe(true);

    // Check the inline comment
    const inlineCommentLine = children?.find(
      (child) => child.type === "TERM" && child.line === 3
    );
    expect(inlineCommentLine?.content).toBe("b");
    const inlineComment = children?.find(
      (child) =>
        child.type === "COMMENT" &&
        child.line === 3 &&
        child.content === "%comment"
    );
    expect(inlineComment).not.toBeNull();
  });

  test("should parse list with anonymous variables in RULESET mode", () => {
    const state: ParserState = createParserState(
      rulesetLexer("[_, [a, _]]"),
      "RULESET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[_, [a, _]]");

    // Check first anonymous variable
    const firstVar = result?.children?.[1];
    expect(firstVar?.type).toBe("TERM");
    expect(firstVar?.children?.[0].type).toBe("VARIABLE");
    expect(firstVar?.children?.[0].children?.[0].type).toBe(
      "VARIABLE_ANONYMOUS"
    );

    // Check nested list with anonymous variable
    const nestedList = result?.children?.[4]?.children?.[0];
    expect(nestedList?.type).toBe("LIST_TERM");
    const nestedVar = nestedList?.children?.[4]?.children?.[0];
    expect(nestedVar?.type).toBe("VARIABLE");
    expect(nestedVar?.children?.[0].type).toBe("VARIABLE_ANONYMOUS");
  });

  test("should parse list with named variables in RULESET mode", () => {
    const state: ParserState = createParserState(
      rulesetLexer("[First, Rest]"),
      "RULESET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[First, Rest]");

    // Check first variable
    const firstVar = result?.children?.[1]?.children?.[0];
    expect(firstVar?.type).toBe("VARIABLE");
    expect(firstVar?.children?.[0].type).toBe("VARIABLE_NAMED");
    expect(firstVar?.children?.[0].content).toBe("First");

    // Check second variable
    const restVar = result?.children?.[4]?.children?.[0];
    expect(restVar?.type).toBe("VARIABLE");
    expect(restVar?.children?.[0].type).toBe("VARIABLE_NAMED");
    expect(restVar?.children?.[0].content).toBe("Rest");
  });

  test("should parse list with mixed variables and terms in RULESET mode", () => {
    const state: ParserState = createParserState(
      rulesetLexer("[X, _, y, Z]"),
      "RULESET"
    );

    const [result] = parseListTerm(state);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LIST_TERM");
    expect(result?.content).toBe("[X, _, y, Z]");

    const terms = result?.children?.filter((child) => child.type === "TERM");
    expect(terms).toHaveLength(4);

    // Check first named variable
    expect(terms?.[0]?.children?.[0].type).toBe("VARIABLE");
    expect(terms?.[0]?.children?.[0].children?.[0].type).toBe("VARIABLE_NAMED");

    // Check anonymous variable
    expect(terms?.[1]?.children?.[0].type).toBe("VARIABLE");
    expect(terms?.[1]?.children?.[0].children?.[0].type).toBe(
      "VARIABLE_ANONYMOUS"
    );

    // Check constant term
    expect(terms?.[2]?.children?.[0].type).toBe("SIMPLE_TERM");

    // Check last named variable
    expect(terms?.[3]?.children?.[0].type).toBe("VARIABLE");
    expect(terms?.[3]?.children?.[0].children?.[0].type).toBe("VARIABLE_NAMED");
  });

  test("should not parse variables in lists in DATASET mode", () => {
    const state: ParserState = createParserState(
      datasetLexer("[X]"),
      "DATASET"
    );

    const [result] = parseListTerm(state);
    expect(result?.type).toBe("ERROR");
  });
});
