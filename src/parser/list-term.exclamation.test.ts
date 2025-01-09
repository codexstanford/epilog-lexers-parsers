import { describe, expect, test } from "bun:test";
import type { ParserState } from "../types";
import { parseListTerm } from "./list-term";
import { createParserState } from "./_control-flow";
import { datasetLexer } from "../dataset-lexer";
import { rulesetLexer } from "../ruleset-lexer";

describe("parseListTerm", () => {
  describe("exclamation-separated", () => {
    test("should not parse single term", () => {
      const state: ParserState = createParserState(
        datasetLexer("x"),
        "DATASET"
      );

      const [result] = parseListTerm(state);
      expect(result).toBeNull();
    });

    test("should parse two terms", () => {
      const state: ParserState = createParserState(
        datasetLexer("x!y"),
        "DATASET"
      );

      const [result] = parseListTerm(state);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("LIST_TERM");
      expect(result?.content).toBe("x!y");
      expect(result?.children).toHaveLength(3);
      expect(result?.children?.[0]?.type).toBe("TERM");
      expect(result?.children?.[0]?.content).toBe("x");
      expect(result?.children?.[1]?.type).toBe("LIST_SEPARATOR");
      expect(result?.children?.[1]?.content).toBe("!");
      expect(result?.children?.[2]?.type).toBe("TERM");
      expect(result?.children?.[2]?.content).toBe("y");
    });

    test("should parse multiple terms", () => {
      const state: ParserState = createParserState(
        datasetLexer("a!b!c!d"),
        "DATASET"
      );

      const [result] = parseListTerm(state);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("LIST_TERM");
      expect(result?.content).toBe("a!b!c!d");
      expect(result?.children).toHaveLength(7);
      expect(result?.children?.[0]?.type).toBe("TERM");
      expect(result?.children?.[0]?.content).toBe("a");
      expect(result?.children?.[2]?.content).toBe("b");
      expect(result?.children?.[4]?.content).toBe("c");
      expect(result?.children?.[6]?.content).toBe("d");
    });

    test("should handle whitespace between terms", () => {
      const state: ParserState = createParserState(
        datasetLexer("x ! y"),
        "DATASET"
      );

      const [result] = parseListTerm(state);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("LIST_TERM");
      expect(result?.content).toBe("x ! y");
      expect(result?.children).toHaveLength(5);
      expect(result?.children?.[0]?.type).toBe("TERM");
      expect(result?.children?.[1]?.type).toBe("WHITESPACE");
      expect(result?.children?.[2]?.type).toBe("LIST_SEPARATOR");
      expect(result?.children?.[3]?.type).toBe("WHITESPACE");
      expect(result?.children?.[4]?.type).toBe("TERM");
    });

    test("should handle error for trailing exclamation", () => {
      const state: ParserState = createParserState(
        datasetLexer("x!"),
        "DATASET"
      );

      const [result] = parseListTerm(state);
      expect(result?.type).toBe("ERROR");
    });

    test("should handle error for consecutive exclamations", () => {
      const state: ParserState = createParserState(
        datasetLexer("x!!y"),
        "DATASET"
      );

      const [result] = parseListTerm(state);
      expect(result?.type).toBe("ERROR");
    });

    test("should parse compound terms", () => {
      const state: ParserState = createParserState(
        datasetLexer("f(x)!g(y)"),
        "DATASET"
      );

      const [result] = parseListTerm(state);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("LIST_TERM");
      expect(result?.content).toBe("f(x)!g(y)");
      expect(result?.children).toHaveLength(3);
      expect(result?.children?.[0]?.children?.[0].type).toBe("COMPOUND_TERM");
      expect(result?.children?.[2]?.children?.[0].type).toBe("COMPOUND_TERM");
    });

    test("should parse multi-line list", () => {
      const state: ParserState = createParserState(
        datasetLexer("a!\nb!\nc"),
        "DATASET"
      );

      const [result] = parseListTerm(state);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("LIST_TERM");
      expect(result?.content).toBe("a!\nb!\nc");
      expect(result?.line).toBe(1);
      expect(result?.endLine).toBe(3);
    });

    test("should parse variables in RULESET mode", () => {
      const state: ParserState = createParserState(
        rulesetLexer("X!_!Y"),
        "RULESET"
      );

      const [result] = parseListTerm(state);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("LIST_TERM");
      expect(result?.content).toBe("X!_!Y");

      const terms = result?.children?.filter((child) => child.type === "TERM");
      expect(terms?.[0]?.children?.[0].type).toBe("VARIABLE");
      expect(terms?.[1]?.children?.[0].type).toBe("VARIABLE");
      expect(terms?.[2]?.children?.[0].type).toBe("VARIABLE");
    });

    test("should not parse variables in DATASET mode", () => {
      const state: ParserState = createParserState(
        rulesetLexer("X!Y"), // we need to use rulesetLexer to get variables, otherwise vars wouldn't end up in tokens
        "DATASET"
      );

      const [result] = parseListTerm(state);
      expect(result).toBeNull();
    });
  });
});
