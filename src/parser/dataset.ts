import type { ParserState, RulesetParserObject, RulesetToken } from "../types";
import { consumeWhitespaces } from "./_common";
import {
  createParserState,
  peek,
  createErrorObjectAndAdvanceToNextLine,
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
    const [whitespaces, afterWhitespace] = consumeWhitespaces(currentState);
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

  return {
    type: "DATASET",
    start: children.length > 0 ? children[0].start : 0,
    end: children.length > 0 ? children[children.length - 1].end : 0,
    line: children.length > 0 ? children[0].line : 1,
    content: children.map((child) => child.content).join(""),
    children,
  };
}
