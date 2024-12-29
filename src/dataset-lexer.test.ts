import { expect, test, describe } from "bun:test";
import { datasetLexer, DatasetTokenType } from "./dataset-lexer";
import { validateTokenBoundaries } from "./test-utils";

describe("datasetLexer", () => {
  test("empty input produces only EOF token", () => {
    const input = "";
    const tokens = datasetLexer(input);
    validateTokenBoundaries(input, tokens);
  });

  test("simple tokens don't have gaps or overlaps", () => {
    const input = "123 abc\n";
    const tokens = datasetLexer(input);
    validateTokenBoundaries(input, tokens);
  });

  test("complex input maintains token boundary integrity", () => {
    const input = "number = 42.5\nstring = 'hello'\n";
    const tokens = datasetLexer(input);
    validateTokenBoundaries(input, tokens);
  });

  /* -------------------------------------------------------------------------- */
  /*                                  Chapter 2                                 */
  /* -------------------------------------------------------------------------- */

  // http://logicprogramming.stanford.edu/notes/chapter_02.html

  test("correctly lexes family relationships dataset", () => {
    const input = [
      "parent(art,bob)",
      "parent(art,bea)",
      "",
      "parent(bea,coe)",
    ].join("\n");

    const tokens = datasetLexer(input);

    validateTokenBoundaries(input, tokens);

    // Verify the first fact's tokens as a sample
    expect(tokens[0].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[0].content).toBe("parent");
    expect(tokens[1].type).toBe(DatasetTokenType.OPEN_PAREN);
    expect(tokens[2].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[2].content).toBe("art");
    expect(tokens[3].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[4].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[4].content).toBe("bob");
    expect(tokens[5].type).toBe(DatasetTokenType.CLOSE_PAREN);

    // Verify the second fact's tokens as a sample
    expect(tokens[6].type).toBe(DatasetTokenType.WHITESPACE);
    expect(tokens[7].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[7].content).toBe("parent");
    expect(tokens[8].type).toBe(DatasetTokenType.OPEN_PAREN);
    expect(tokens[9].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[9].content).toBe("art");
    expect(tokens[10].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[11].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[11].content).toBe("bea");
    expect(tokens[12].type).toBe(DatasetTokenType.CLOSE_PAREN);

    // Verify the third fact's tokens as a sample
    expect(tokens[13].type).toBe(DatasetTokenType.WHITESPACE);
    expect(tokens[14].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[14].content).toBe("parent");
    expect(tokens[15].type).toBe(DatasetTokenType.OPEN_PAREN);
    expect(tokens[16].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[16].content).toBe("bea");
    expect(tokens[17].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[18].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[18].content).toBe("coe");
    expect(tokens[19].type).toBe(DatasetTokenType.CLOSE_PAREN);
  });

  test("correctly lexes menu dataset with nested structures", () => {
    const input = [
      "menu(monday,three(calamari,beef,shortcake))",
      "menu(monday,three(puree,beef,icecream))",
      "menu(friday,five(vichyssoise,green,trout,beef,souffle))",
    ].join("\n");

    const tokens = datasetLexer(input);
    validateTokenBoundaries(input, tokens);

    // Verify the first menu entry's tokens
    expect(tokens[0].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[0].content).toBe("menu");
    expect(tokens[1].type).toBe(DatasetTokenType.OPEN_PAREN);
    expect(tokens[2].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[2].content).toBe("monday");
    expect(tokens[3].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[4].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[4].content).toBe("three");
    expect(tokens[5].type).toBe(DatasetTokenType.OPEN_PAREN);
    expect(tokens[6].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[6].content).toBe("calamari");
    expect(tokens[7].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[8].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[8].content).toBe("beef");
    expect(tokens[9].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[10].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[10].content).toBe("shortcake");
    expect(tokens[11].type).toBe(DatasetTokenType.CLOSE_PAREN);
    expect(tokens[12].type).toBe(DatasetTokenType.CLOSE_PAREN);

    // Verify the second menu entry's tokens
    expect(tokens[13].type).toBe(DatasetTokenType.WHITESPACE);
    expect(tokens[14].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[14].content).toBe("menu");
    expect(tokens[15].type).toBe(DatasetTokenType.OPEN_PAREN);
    expect(tokens[16].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[16].content).toBe("monday");
    expect(tokens[17].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[18].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[18].content).toBe("three");
    expect(tokens[19].type).toBe(DatasetTokenType.OPEN_PAREN);
    expect(tokens[20].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[20].content).toBe("puree");
    expect(tokens[21].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[22].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[22].content).toBe("beef");
    expect(tokens[23].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[24].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[24].content).toBe("icecream");
    expect(tokens[25].type).toBe(DatasetTokenType.CLOSE_PAREN);
    expect(tokens[26].type).toBe(DatasetTokenType.CLOSE_PAREN);

    // Verify the third menu entry's tokens
    expect(tokens[27].type).toBe(DatasetTokenType.WHITESPACE);
    expect(tokens[28].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[28].content).toBe("menu");
    expect(tokens[29].type).toBe(DatasetTokenType.OPEN_PAREN);
    expect(tokens[30].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[30].content).toBe("friday");
    expect(tokens[31].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[32].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[32].content).toBe("five");
    expect(tokens[33].type).toBe(DatasetTokenType.OPEN_PAREN);
    expect(tokens[34].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[34].content).toBe("vichyssoise");
    expect(tokens[35].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[36].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[36].content).toBe("green");
    expect(tokens[37].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[38].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[38].content).toBe("trout");
    expect(tokens[39].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[40].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[40].content).toBe("beef");
    expect(tokens[41].type).toBe(DatasetTokenType.COMMA);
    expect(tokens[42].type).toBe(DatasetTokenType.CONSTANT);
    expect(tokens[42].content).toBe("souffle");
    expect(tokens[43].type).toBe(DatasetTokenType.CLOSE_PAREN);
    expect(tokens[44].type).toBe(DatasetTokenType.CLOSE_PAREN);
  });
});
