import { describe, expect, test } from "bun:test";
import { rulesetLexer } from "../ruleset-lexer";
import { parseRuleset } from "./ruleset";

describe("parseRuleset", () => {
  test("should parse single rule", () => {
    const result = parseRuleset(rulesetLexer("mortal(X) :- human(X)."));

    expect(result.type).toBe("RULESET");
    expect(result.children).toHaveLength(1);
    expect(result.children).toBeDefined();
    expect(result.children![0].type).toBe("RULE");
  });

  test("should parse single operation", () => {
    const result = parseRuleset(
      rulesetLexer("move(X,Y):: valid(X) ==> at(X).")
    );

    expect(result.type).toBe("RULESET");
    expect(result.children).toHaveLength(1);
    expect(result.children).toBeDefined();
    expect(result.children![0].type).toBe("OPERATION");
  });

  test("should parse single definition", () => {
    const result = parseRuleset(rulesetLexer("parent(X,Y) := father(X,Y)."));

    expect(result.type).toBe("RULESET");
    expect(result.children).toHaveLength(1);
    expect(result.children).toBeDefined();
    expect(result.children![0].type).toBe("DEFINITION");
  });

  test("should parse combination of rule, operation, and definition", () => {
    const result = parseRuleset(
      rulesetLexer(`
      mortal(X) :- human(X).
      move(X,Y):: valid(X) ==> at(X).
      parent(X,Y) := father(X,Y).
    `)
    );

    expect(result.type).toBe("RULESET");
    const nonWhitespaceChildren =
      result.children?.filter(
        (child) => !["WHITESPACE", "COMMENT"].includes(child.type)
      ) || [];
    expect(nonWhitespaceChildren).toHaveLength(3);
    expect(nonWhitespaceChildren[0].type).toBe("RULE");
    expect(nonWhitespaceChildren[1].type).toBe("OPERATION");
    expect(nonWhitespaceChildren[2].type).toBe("DEFINITION");
  });

  test("should handle comments between elements", () => {
    const result = parseRuleset(
      rulesetLexer(`
      % First rule
      mortal(X) :- human(X).
      % An operation
      move(X,Y):: valid(X).
    `)
    );

    expect(result.type).toBe("RULESET");
    expect(result.children?.some((child) => child.type === "COMMENT")).toBe(
      true
    );
    const nonWhitespaceCommentChildren =
      result.children?.filter(
        (child) => !["WHITESPACE", "COMMENT"].includes(child.type)
      ) || [];
    expect(nonWhitespaceCommentChildren).toHaveLength(2);
  });

  test("should handle empty input", () => {
    const result = parseRuleset(rulesetLexer(""));

    expect(result.type).toBe("RULESET");
    expect(result.children).toHaveLength(0);
  });

  test("should handle whitespace-only input", () => {
    const result = parseRuleset(rulesetLexer("  \n  \t  "));

    expect(result.type).toBe("RULESET");
    expect(result.children?.every((child) => child.type === "WHITESPACE")).toBe(
      true
    );
  });

  test("should recover from errors and continue parsing", () => {
    const result = parseRuleset(
      rulesetLexer(`
      mortal(X) :- .\n
      valid(X) :- test(X).
    `)
    );

    // console.log(JSON.stringify(result, null, 2));

    expect(result.type).toBe("RULESET");
    const errors =
      result.children?.filter((child) => child.type === "ERROR") || [];
    expect(errors.length).toBeGreaterThan(0);
    expect(result.children?.some((child) => child.type === "RULE")).toBe(true);
  });

  test("should parse multiple consecutive elements without whitespace", () => {
    const result = parseRuleset(
      rulesetLexer("p(X) :- q(X).r(Y) := s(Y).t(Z):: u(Z).")
    );

    expect(result.type).toBe("RULESET");
    const nonWhitespaceChildren = result.children?.filter(
      (child) => !["WHITESPACE", "COMMENT"].includes(child.type)
    );
    expect(nonWhitespaceChildren).toHaveLength(3);
  });
});
