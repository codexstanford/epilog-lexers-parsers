import type { DatasetParserObject, DatasetToken, ParserState } from "./types";

/* -------------------------------------------------------------------------- */
/*                                Control flow                                */
/* -------------------------------------------------------------------------- */

/**
 * Parses a sequence of tokens into a dataset structure
 * @param tokens Array of lexer tokens to parse
 * @returns A dataset parser object containing the parsed structure
 */
export function datasetParser(tokens: DatasetToken[]): DatasetParserObject {
  const initialState = createState(tokens);
  const facts: DatasetParserObject[] = [];
  let currentState = initialState;

  while (peek(currentState)) {
    const [fact, newState] = parseFact(currentState);
    if (fact) {
      facts.push(fact);
      currentState = newState;
    } else {
      const [_, nextState] = advance(currentState);
      currentState = nextState;
    }
  }

  return {
    type: "DATASET",
    start: facts.length > 0 ? facts[0].start : 0,
    end: facts.length > 0 ? facts[facts.length - 1].end : 0,
    line: facts.length > 0 ? facts[0].line : 1,
    content: facts.map((f) => f.content).join(""),
    children: facts,
  };
}





/* -------------------------------------------------------------------------- */
/*                            Object type specific                            */
/* -------------------------------------------------------------------------- */

/**
 * Parses a fact.
 * Children are the following:
 * - one of:
 *   - constant
 *   - number
 *   - string
 * - (optional)
 *   - open paren
 *   - (optional)
 *     - one or more comma-separated terms (same as above)
 *   - close paren
 * - (optional) punctuation period
 * @param state Current parser state
 * @returns Tuple of [parsed fact object or null if not a valid fact, new state]
 */
function parseFact(
  state: ParserState
): [DatasetParserObject | null, ParserState] {
  /* -------------------------------- 1. Child -------------------------------- */

  const firstToken = peek(state);
  if (!firstToken) return [null, state];

  // TODO number wasn't specified as possible dataset token type
  // TODO we might need to return an error object if condition is met
  // Check if first token is valid fact identifier
  if (!["CONSTANT", "NUMBER", "STRING"].includes(firstToken.type)) {
    return [null, state];
  }

  const [identifier, state1] = advance(state);
  let currentState = state1;

  if (!identifier)
    throw Error(
      "Since peek hasn't returned null, [0] of advance's return value should also not be null"
    );

  const children: DatasetParserObject[] = [identifier];

  /* ------------------------------ 1 + n. Child ------------------------------ */

  // Check for opening parenthesis
  const nextToken = peek(currentState);

  if (nextToken?.type === "OPEN_PAREN") {
    const [openParen, state2] = advance(currentState);
    currentState = state2;

    if (!openParen)
      throw Error(
        "Since peek hasn't returned null, [0] of advance's return value should also not be null"
      );

    children.push(openParen);

    // Parse arguments
    while (true) {
      const argToken = peek(currentState);
      if (!argToken) break;

      if (["CONSTANT", "NUMBER", "STRING"].includes(argToken.type)) {
        const [arg, state3] = advance(currentState);
        currentState = state3;
        children.push({
          type: arg.type,
          start: arg.start,
          end: arg.end,
          line: arg.line,
          content: arg.content,
          children: [],
        });

        const afterArg = peek(currentState);
        if (afterArg?.type === "COMMA") {
          const [comma, state4] = advance(currentState);
          currentState = state4;
          children.push({
            type: "COMMA",
            start: comma.start,
            end: comma.end,
            line: comma.line,
            content: comma.content,
            children: [],
          });
          continue;
        }
      }
      break;
    }

    // Expect closing parenthesis
    const closeToken = peek(currentState);

    if (closeToken?.type === "CLOSE_PAREN") {
      const [closeParen, state5] = advance(currentState);
      currentState = state5;

      if (!closeParen)
        throw Error(
          "Since peek hasn't returned null, [0] of advance's return value should also not be null"
        );

      children.push(closeParen);
    } else {
      openParen.type = "ERROR";
      openParen.errorMessage = "Expected closing parenthesis";
    }
  }

  /* ------------------------------- Last Child ------------------------------- */

  // Check for optional period
  const periodToken = peek(currentState);

  if (periodToken?.type === "PERIOD") {
    const [period, state6] = advance(currentState);
    currentState = state6;

    if (!period)
      throw Error(
        "Since peek hasn't returned null, [0] of advance's return value should also not be null"
      );

    children.push(period);
  }

  // Create fact object
  const fact: DatasetParserObject = {
    type: "FACT",
    start: identifier.start,
    end: children[children.length - 1].end,
    line: identifier.line,
    content: children.map((c) => c.content).join(""),
    children,
  };

  return [fact, currentState];
}

/**
 * Child is one of the following:
 * - constant term
 * - compound term
 * - list term
 * @param state
 */
function parseTerm(
  state: ParserState
): [DatasetParserObject | null, ParserState] {}
