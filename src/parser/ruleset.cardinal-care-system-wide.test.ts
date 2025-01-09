import { describe, expect, test } from "bun:test";
import { rulesetLexer } from "../ruleset-lexer";
import { parseRuleset } from "./ruleset";
import { findErrors } from "../test-utils";

const systemWideRuleset = `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% general definitions and predefined relations
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

claim.birthdate(C,D) :- claim.patient(C,P) & person.dob(P,D)

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

overlap(XS,XE,YS,YE) :-
  evaluate(stringmin(YS,XE),YS) &
  evaluate(stringmin(XS,YE),XS)

datetimetotimestamp(DATE,TIME,STAMP) :-
  evaluate(parsedate(DATE),[Y,M,D]) &
  evaluate(parsetime(TIME),[H,N]) &
  evaluate(maketimestamp(Y,M,D,H,N,0),STAMP)

parsedate(DATE) :=
  map(readstring,tail(matches(stringify(DATE),"(....)_(..)_(..)")))

parsetime(TIME) :=
  map(readstring,tail(matches(stringify(TIME),"(..)_(..)")))

head(X!L) := X
tail(X!L) := L

%%% number relations, e.g. less, greater
%%% string relations, e.g. stringappend
%%% date relations, e.g. dateplus
%%% and so forth...`;

describe("parseRuleset", () => {
  describe("Cardinal Care System-wide Ruleset", () => {
    test("should parse the complete system-wide ruleset", () => {
      const result = parseRuleset(rulesetLexer(systemWideRuleset));

      expect(result.type).toBe("RULESET");
      expect(result.children).toBeDefined();

      const errors = findErrors(result);
      expect(errors).toHaveLength(0);
    });

    test("should parse helper functions with evaluate calls", () => {
      const result = parseRuleset(rulesetLexer(systemWideRuleset));

      const evaluateRules = result.children?.filter(
        (child) => child.type === "RULE" && child.content?.includes("evaluate")
      );

      expect(evaluateRules?.length).toBeGreaterThan(0);
    });

    test("should correctly parse datetime conversion rules", () => {
      const result = parseRuleset(rulesetLexer(systemWideRuleset));

      const dateTimeRule = result.children?.find(
        (child) =>
          child.type === "RULE" &&
          child.children?.[0]?.content?.includes("datetimetotimestamp")
      );

      expect(dateTimeRule).toBeDefined();
      expect(dateTimeRule?.children?.length).toBeGreaterThan(1);
    });

    test("should handle list operations correctly", () => {
      const result = parseRuleset(rulesetLexer(systemWideRuleset));

      const listRules = result.children?.filter(
        (child) =>
          child.type === "DEFINITION" &&
          (child.children?.[0]?.content?.includes("head") ||
            child.children?.[0]?.content?.includes("tail"))
      );

      expect(listRules?.length).toBe(2);
    });
  });
});
