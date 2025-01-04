import { expect, test, describe } from "bun:test";
import { datasetLexer } from "./dataset-lexer";
import { validateTokenBoundaries } from "./test-utils";

describe("datasetLexer", () => {
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
    expect(tokens[0].type).toBe("CONSTANT");
    expect(tokens[0].content).toBe("parent");
    expect(tokens[1].type).toBe("OPEN_PAREN");
    expect(tokens[2].type).toBe("CONSTANT");
    expect(tokens[2].content).toBe("art");
    expect(tokens[3].type).toBe("COMMA");
    expect(tokens[4].type).toBe("CONSTANT");
    expect(tokens[4].content).toBe("bob");
    expect(tokens[5].type).toBe("CLOSE_PAREN");
    expect(tokens[6].type).toBe("WHITESPACE");
    expect(tokens[6].content).toBe("\n");

    // Verify the second fact's tokens as a sample
    expect(tokens[7].type).toBe("CONSTANT");
    expect(tokens[7].content).toBe("parent");
    expect(tokens[8].type).toBe("OPEN_PAREN");
    expect(tokens[9].type).toBe("CONSTANT");
    expect(tokens[9].content).toBe("art");
    expect(tokens[10].type).toBe("COMMA");
    expect(tokens[11].type).toBe("CONSTANT");
    expect(tokens[11].content).toBe("bea");
    expect(tokens[12].type).toBe("CLOSE_PAREN");
    expect(tokens[13].type).toBe("WHITESPACE");
    expect(tokens[13].content).toBe("\n");

    // Verify blank line
    expect(tokens[14].type).toBe("WHITESPACE");
    expect(tokens[14].content).toBe("\n");

    // Verify the third fact's tokens as a sample
    expect(tokens[15].type).toBe("CONSTANT");
    expect(tokens[15].content).toBe("parent");
    expect(tokens[16].type).toBe("OPEN_PAREN");
    expect(tokens[17].type).toBe("CONSTANT");
    expect(tokens[17].content).toBe("bea");
    expect(tokens[18].type).toBe("COMMA");
    expect(tokens[19].type).toBe("CONSTANT");
    expect(tokens[19].content).toBe("coe");
    expect(tokens[20].type).toBe("CLOSE_PAREN");
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
    expect(tokens[0].type).toBe("CONSTANT");
    expect(tokens[0].content).toBe("menu");
    expect(tokens[1].type).toBe("OPEN_PAREN");
    expect(tokens[2].type).toBe("CONSTANT");
    expect(tokens[2].content).toBe("monday");
    expect(tokens[3].type).toBe("COMMA");
    expect(tokens[4].type).toBe("CONSTANT");
    expect(tokens[4].content).toBe("three");
    expect(tokens[5].type).toBe("OPEN_PAREN");
    expect(tokens[6].type).toBe("CONSTANT");
    expect(tokens[6].content).toBe("calamari");
    expect(tokens[7].type).toBe("COMMA");
    expect(tokens[8].type).toBe("CONSTANT");
    expect(tokens[8].content).toBe("beef");
    expect(tokens[9].type).toBe("COMMA");
    expect(tokens[10].type).toBe("CONSTANT");
    expect(tokens[10].content).toBe("shortcake");
    expect(tokens[11].type).toBe("CLOSE_PAREN");
    expect(tokens[12].type).toBe("CLOSE_PAREN");

    // Verify the second menu entry's tokens
    expect(tokens[13].type).toBe("WHITESPACE");
    expect(tokens[14].type).toBe("CONSTANT");
    expect(tokens[14].content).toBe("menu");
    expect(tokens[15].type).toBe("OPEN_PAREN");
    expect(tokens[16].type).toBe("CONSTANT");
    expect(tokens[16].content).toBe("monday");
    expect(tokens[17].type).toBe("COMMA");
    expect(tokens[18].type).toBe("CONSTANT");
    expect(tokens[18].content).toBe("three");
    expect(tokens[19].type).toBe("OPEN_PAREN");
    expect(tokens[20].type).toBe("CONSTANT");
    expect(tokens[20].content).toBe("puree");
    expect(tokens[21].type).toBe("COMMA");
    expect(tokens[22].type).toBe("CONSTANT");
    expect(tokens[22].content).toBe("beef");
    expect(tokens[23].type).toBe("COMMA");
    expect(tokens[24].type).toBe("CONSTANT");
    expect(tokens[24].content).toBe("icecream");
    expect(tokens[25].type).toBe("CLOSE_PAREN");
    expect(tokens[26].type).toBe("CLOSE_PAREN");

    // Verify the third menu entry's tokens
    expect(tokens[27].type).toBe("WHITESPACE");
    expect(tokens[28].type).toBe("CONSTANT");
    expect(tokens[28].content).toBe("menu");
    expect(tokens[29].type).toBe("OPEN_PAREN");
    expect(tokens[30].type).toBe("CONSTANT");
    expect(tokens[30].content).toBe("friday");
    expect(tokens[31].type).toBe("COMMA");
    expect(tokens[32].type).toBe("CONSTANT");
    expect(tokens[32].content).toBe("five");
    expect(tokens[33].type).toBe("OPEN_PAREN");
    expect(tokens[34].type).toBe("CONSTANT");
    expect(tokens[34].content).toBe("vichyssoise");
    expect(tokens[35].type).toBe("COMMA");
    expect(tokens[36].type).toBe("CONSTANT");
    expect(tokens[36].content).toBe("green");
    expect(tokens[37].type).toBe("COMMA");
    expect(tokens[38].type).toBe("CONSTANT");
    expect(tokens[38].content).toBe("trout");
    expect(tokens[39].type).toBe("COMMA");
    expect(tokens[40].type).toBe("CONSTANT");
    expect(tokens[40].content).toBe("beef");
    expect(tokens[41].type).toBe("COMMA");
    expect(tokens[42].type).toBe("CONSTANT");
    expect(tokens[42].content).toBe("souffle");
    expect(tokens[43].type).toBe("CLOSE_PAREN");
    expect(tokens[44].type).toBe("CLOSE_PAREN");
  });
});
