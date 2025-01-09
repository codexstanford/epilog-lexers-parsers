import { describe, expect, test } from "bun:test";
import { rulesetLexer } from "../ruleset-lexer";
import { parseRuleset } from "./ruleset";
import { findErrors } from "../test-utils";

const insurancePolicyRuleset = `
covered(C, N) :- 
    claim.policy(C, P) & 
    policy.in_effect(P) & 
    claim.hospitalization(C, H) & 
    hospitalization_conditions_met(H) & 
    benefit_calc(C, N) & 
    ~exclusion_applies(C)

policy.in_effect(P) :- 
    policy.signed(P) & 
    policy.paid_premium(P) & 
    condition_met_1.3(P) & 
    ~policy.canceled(P)

condition_met_1.3(P) :- policy.wellness_visit_confirmation_provided(P)

policy.paid_premium(P) :- 
    policy.premium_amount_paid(P, A) &
    geq(A, 2000)

hospitalization_conditions_met(H) :- hospitalization_valid_reason(H) & hospitalization.country(H, usa)

hospitalization_valid_reason(H) :- hospitalization.reason(H, sickness)
hospitalization_valid_reason(H) :- hospitalization.reason(H, accidental_injury)

exclusion_applies(C) :- 
    claim.hospitalization(C, H) & 
    hospitalization.causal_event(H, skydiving)
exclusion_applies(C) :- 
    claim.hospitalization(C, H) & 
    hospitalization.causal_event(H, military_service)
exclusion_applies(C) :- 
    claim.hospitalization(C, H) & 
    hospitalization.causal_event(H, firefighting_service)
exclusion_applies(C) :- 
    claim.hospitalization(C, H) & 
    hospitalization.causal_event(H, police_service)
exclusion_applies(C) :- 
    claim.hospitalization(C, H) & 
    hospitalization.patient(H, X) & 
    person.age(X, A) & 
    geq(A, 75)

benefit_calc(C,N) :- 
    claim.hospitalization(C, H) & 
    duration_days(H, D) & 
    evaluate(max(0,times(D, 500)), N)

duration_days(H, D) :- 
    duration(H, D_MS) & 
    evaluate(floor(quotient(D_MS, 86400000)), D)

duration(Z,DURATION) :-
    hospitalization.startdate(Z,SD) &
    hospitalization.starttime(Z,ST) &
    hospitalization.enddate(Z,ED) &
    hospitalization.endtime(Z,ET) &
    datetimetotimestamp(SD,ST,SS) &
    datetimetotimestamp(ED,ET,ES) &
    evaluate(minus(ES,SS),DURATION)

geq(X, Y) :- evaluate(min(X,Y), Y)
`;

describe("parseRuleset", () => {
  describe("Formation Demo Ruleset", () => {
    test("should parse the complete insurance policy ruleset", () => {
      const result = parseRuleset(rulesetLexer(insurancePolicyRuleset));

      expect(result.type).toBe("RULESET");
      expect(result.children).toBeDefined();

      const errors = findErrors(result);
      expect(errors).toHaveLength(0);

      const rules =
        result.children?.filter((child) => child.type === "RULE") || [];

      expect(rules.length).toBeGreaterThan(0);
    });

    test("should correctly parse complex rules with multiple conditions", () => {
      const result = parseRuleset(rulesetLexer(insurancePolicyRuleset));

      const coveredRule = result.children?.find(
        (child) =>
          child.type === "RULE" &&
          child.children?.[0]?.content?.startsWith("covered")
      );

      expect(coveredRule).toBeDefined();
      expect(coveredRule?.children?.length).toBeGreaterThan(1);
    });

    test("should handle negated conditions correctly", () => {
      const result = parseRuleset(rulesetLexer(insurancePolicyRuleset));

      const policyInEffectRule = result.children?.find(
        (child) =>
          child.type === "RULE" &&
          child.children?.[0]?.content?.includes("policy.in_effect")
      );

      expect(policyInEffectRule).toBeDefined();
      const negatedCondition = policyInEffectRule?.children?.some((child) =>
        child.content?.includes("~policy.canceled")
      );
      expect(negatedCondition).toBe(true);
    });

    test("should parse evaluate function calls correctly", () => {
      const result = parseRuleset(rulesetLexer(insurancePolicyRuleset));

      const evaluateRules = result.children?.filter(
        (child) => child.type === "RULE" && child.content?.includes("evaluate")
      );

      expect(evaluateRules?.length).toBeGreaterThan(0);
    });
  });
});
