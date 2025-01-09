import type { RulesetParserObject, RulesetToken } from "../types";
import { consumeWhitespacesAndComments, createParserObject } from "./_common";
import {
  createErrorObjectAndAdvanceToNextLine,
  createParserState,
  peek,
} from "./_control-flow";
import { parseDefinition } from "./definition";
import { parseOperation } from "./operation";
import { parseRule } from "./rule";

/**
 * Children are 0 or more rules, operations, and/or definitions, i.e. (rule | operation | definition)
 * @param state
 */
export function parseRuleset(tokens: RulesetToken[]): RulesetParserObject {
  let currentState = createParserState(tokens, "RULESET");
  const children = [] as RulesetParserObject[];

  while (true) {
    // Consume whitespaces before trying to parse a rule, operation, or definition
    const [whitespaces, afterWhitespace] =
      consumeWhitespacesAndComments(currentState);
    const hadWhitespace = whitespaces.length > 0;

    if (hadWhitespace) {
      children.push(...whitespaces);
      currentState = afterWhitespace;
    }

    // Try to parse an operation
    const [operation, afterOperation] = parseOperation(currentState);
    if (operation) {
      children.push(operation);
      currentState = afterOperation;
      continue;
    }

    // Try to parse a definition
    const [definition, afterDefinition] = parseDefinition(currentState);
    if (definition) {
      children.push(definition);
      currentState = afterDefinition;
      continue;
    }

    // Try to parse a rule
    // Must come last, because a rule can be just an atom and would otherwise catch
    // what would come before the operation and the defionition separator above
    const [rule, afterRule] = parseRule(currentState);
    if (rule) {
      children.push(rule);
      currentState = afterRule;
      continue;
    }

    const nextToken = peek(currentState);
    if (!nextToken) break; // EOF reached

    // If we get here, there is a next token that could not be parsed

    const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
      currentState,
      `Expected a rule, an operation, a definition, whitespace, or a comment, got ${nextToken.type} instead.`
    );
    children.push(errorObject);
    currentState = errorState;
  }

  return createParserObject("RULESET", children);
}
