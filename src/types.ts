/* -------------------------------------------------------------------------- */
/*                                   Common                                   */
/* -------------------------------------------------------------------------- */

export interface Base {
  type: string;
  start: number;
  end: number;
  line: number;
  content: string;
  errorMessage?: string;
}

/* -------------------------------------------------------------------------- */
/*                                    Lexer                                   */
/* -------------------------------------------------------------------------- */

/* --------------------------------- Dataset -------------------------------- */

export type DatasetTokenType =
  | "WHITESPACE"
  | "CONSTANT"
  | "STRING"
  | "NUMBER"
  | "COMMENT"
  | "OPEN_PAREN"
  | "CLOSE_PAREN"
  | "OPEN_BRACKET"
  | "CLOSE_BRACKET"
  | "LIST_SEPARATOR"
  | "COMMA"
  | "PERIOD"
  | "ERROR";

export interface DatasetToken extends Base {
  type: DatasetTokenType;
}

/* --------------------------------- Ruleset -------------------------------- */

export type RulesetTokenType =
  | DatasetTokenType
  | "VARIABLE_NAMED" // a string of letters, digits, and underscores beginning with an uppercase letter
  | "VARIABLE_ANONYMOUS" // a lone underscore
  | "RULE_SEPARATOR_NECK" // :-
  | "AMPERSAND" // &
  | "NEGATION_SYMBOL" // ~
  | "DOUBLE_COLON" // ::
  | "DOUBLE_ARROW" // ==>
  | "DEFINITION_SEPARATOR"; // :=

export interface RulesetToken extends Base {
  type: RulesetTokenType;
}

/* --------------------------------- Common --------------------------------- */

export interface LexerState {
  input: string;
  pos: number;
  line: number;
  tokens: RulesetToken[];
}

/* -------------------------------------------------------------------------- */
/*                                   Parser                                   */
/* -------------------------------------------------------------------------- */

/* --------------------------------- Dataset -------------------------------- */

export type DatasetParserObjectType =
  | "DATASET"
  | "FACT"
  | "TERM"
  | "CONSTANT_TERM"
  | "COMPOUND_TERM"
  | "LIST_TERM"
  | "SYMBOL_TERM"
  | DatasetTokenType;

export interface DatasetParserObject extends Base {
  type: DatasetParserObjectType;
  children?: DatasetParserObject[];
}

/* --------------------------------- Ruleset -------------------------------- */

export type RulesetParserObjectType =
  | DatasetParserObjectType
  | "VARIABLE"
  | "VARIABLE_NAMED"
  | "VARIABLE_ANONYMOUS"
  | "RULE_SEPARATOR_NECK"
  | "AMPERSAND"
  | "NEGATION_SYMBOL"
  | "RULE"
  | "RULE_BODY"
  | "LITERAL"
  | "ATOM"
  | "OPERATION"
  | "DOUBLE_COLON"
  | "DOUBLE_ARROW"
  | "DEFINITION_SEPARATOR"
  | "RULESET";

export interface RulesetParserObject extends Base {
  type: RulesetParserObjectType;
  children?: RulesetParserObject[];
}

/* --------------------------------- Common --------------------------------- */

export interface ParserState {
  setType: "DATASET" | "RULESET";
  tokens: RulesetToken[];
  current: number;
}
