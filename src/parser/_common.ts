import type { ParserState, RulesetParserObject } from "../types";
import { advance, peek } from "./_control-flow";

export function getLastNonWhitespaceObject(
  tokens: RulesetParserObject[]
): RulesetParserObject | null {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].type !== "WHITESPACE") return tokens[i];
  }
  return null;
}

export function consumeWhitespaces(
  state: ParserState
): [RulesetParserObject[], ParserState] {
  const children: RulesetParserObject[] = [];
  let currentState = state;

  while (peek(currentState)?.type === "WHITESPACE") {
    const [token, newState] = advance(currentState);

    if (!token)
      throw Error("If peeked token exists, advance should also return a token");

    children.push(token);
    currentState = newState;
  }

  return [children, currentState] as const;
}
