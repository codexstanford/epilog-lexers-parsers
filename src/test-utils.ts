import { expect } from "bun:test";
import type { RulesetParserObject, RulesetToken } from "./types";

export function validateTokenBoundaries(input: string, tokens: RulesetToken[]) {
  // Sum of all tokens (end - start) should be equal to the input length

  const totalTokenLength = tokens.reduce((sum, token) => {
    return sum + (token.end - token.start);
  }, 0);

  expect(totalTokenLength).toBe(input.length);

  // Tokens should not overlap

  for (let i = 0; i < tokens.length - 1; i++) {
    const current = tokens[i];
    const next = tokens[i + 1];

    if (current.line === next.line) expect(current.end).toEqual(next.start);
    else expect(next.start).toEqual(0);
  }

  // Token content should match the input

  tokens.forEach((token) => {
    expect(token.content.length).toBe(token.end - token.start);
  });
}

export function findErrorPaths(
  obj: RulesetParserObject
): RulesetParserObject[][] {
  const paths: RulesetParserObject[][] = [];

  function traverse(
    node: RulesetParserObject,
    currentPath: RulesetParserObject[]
  ) {
    // Add current node to path
    currentPath.push(node);

    // If current node is an error, add the path
    if (node.type === "ERROR") {
      paths.push([...currentPath]);
    }

    // Traverse all possible children
    if (node.children) {
      for (const child of node.children) {
        traverse(child, [...currentPath]);
      }
    }
  }

  traverse(obj, []);
  return paths;
}
