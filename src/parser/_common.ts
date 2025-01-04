import type { ParserState, RulesetParserObject } from "../types";
import { advance, peek } from "./_control-flow";

export function isWhitespaceOrComment(token: RulesetParserObject): boolean {
  return token.type === "WHITESPACE" || token.type === "COMMENT";
}

export function getLastNonWhitespaceOrCommentObject(
  tokens: RulesetParserObject[]
): RulesetParserObject | null {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (!isWhitespaceOrComment(tokens[i])) return tokens[i];
  }
  return null;
}

export function consumeWhitespacesAndComments(
  state: ParserState
): [RulesetParserObject[], ParserState] {
  const children: RulesetParserObject[] = [];
  let currentState = state;

  while (peek(currentState) && isWhitespaceOrComment(peek(currentState)!)) {
    const [token, newState] = advance(currentState);

    if (!token)
      throw Error("If peeked token exists, advance should also return a token");

    children.push(token);
    currentState = newState;
  }

  return [children, currentState] as const;
}

export function createParserObject(
  type: RulesetParserObject["type"],
  children: RulesetParserObject[],
  errorMsg?: string
): RulesetParserObject {
  const [firstChild] = children;
  const lastChild = children[children.length - 1];

  const endLine = lastChild ? lastChild.endLine ?? lastChild.line : undefined;

  return {
    type: errorMsg ? "ERROR" : type,
    line: children.length > 0 ? firstChild.line : 1,
    start: children.length > 0 ? firstChild.start : 0,
    end: children.length > 0 ? children[children.length - 1].end : 0,
    endLine: endLine && firstChild.line !== endLine ? endLine : undefined,
    content: children.map((c) => c.content).join(""),
    children,
    ...(errorMsg && { errorMessage: "Invalid list structure" }),
  };
}
