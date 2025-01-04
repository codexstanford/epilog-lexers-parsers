import type { RulesetParserObject, RulesetToken } from "../types";
import { consumeWhitespacesAndComments, createParserObject } from "./_common";
import {
  createErrorObjectAndAdvanceToNextLine,
  createParserState,
  peek,
} from "./_control-flow";
import { parseFact } from "./fact";

/**
 * Children are 0 to many facts and whitespaces, can be mixed
 * @param state
 */
export function parseDataset(tokens: RulesetToken[]): RulesetParserObject {
  let currentState = createParserState(tokens, "DATASET");
  const children = [] as RulesetParserObject[];

  while (true) {
    // Consume whitespaces before trying to parse a fact
    const [whitespaces, afterWhitespace] =
      consumeWhitespacesAndComments(currentState);
    const hadWhitespace = whitespaces.length > 0;

    if (hadWhitespace) {
      children.push(...whitespaces);
      currentState = afterWhitespace;
    }

    // Try to parse a fact
    const [fact, afterFact] = parseFact(currentState);

    if (!fact && !hadWhitespace) {
      // Check if we still have tokens to process
      if (peek(currentState)) {
        const [errorObject, errorState] = createErrorObjectAndAdvanceToNextLine(
          currentState,
          `Expected a fact or whitespace, got ${
            peek(currentState)?.content
          } instead.`
        );
        children.push(errorObject);
        currentState = errorState;
        continue;
      }

      break;
    }

    if (fact) {
      children.push(fact);
      currentState = afterFact;
    }
  }

  return createParserObject("DATASET", children);
}
