import { expect, test, describe } from "bun:test";
import { datasetLexer } from "./dataset-lexer";
import { datasetParser } from "./dataset-parser";

describe("datasetParser", () => {
  test("correctly parses family relationships dataset", () => {
    const input = [
      "parent(art,bob)",
      "parent(art,bea)",
      "",
      "parent(bea,coe)",
    ].join("\n");

    const tokens = datasetLexer(input);
    const result = datasetParser(tokens);

    expect(result.type).toBe("DATASET");
    expect(result.children!).toHaveLength(3);

    // Check first fact
    const fact1 = result.children![0];
    expect(fact1.type).toBe("FACT");
    expect(fact1.content).toBe("parent(art,bob)");
    expect(fact1.children!).toHaveLength(6);
    expect(fact1.children![0].content).toBe("parent");
    expect(fact1.children![2].content).toBe("art");
    expect(fact1.children![4].content).toBe("bob");

    // Check second fact
    const fact2 = result.children![1];
    expect(fact2.type).toBe("FACT");
    expect(fact2.content).toBe("parent(art,bea)");
    expect(fact2.children!).toHaveLength(6);
    expect(fact2.children![0].content).toBe("parent");
    expect(fact2.children![2].content).toBe("art");
    expect(fact2.children![4].content).toBe("bea");

    // Check third fact
    const fact3 = result.children![2];
    expect(fact3.type).toBe("FACT");
    expect(fact3.content).toBe("parent(bea,coe)");
    expect(fact3.children!).toHaveLength(6);
    expect(fact3.children![0].content).toBe("parent");
    expect(fact3.children![2].content).toBe("bea");
    expect(fact3.children![4].content).toBe("coe");
  });

  test("correctly parses menu dataset with nested structures", () => {
    const input = [
      "menu(monday,three(calamari,beef,shortcake))",
      "menu(monday,three(puree,beef,icecream))",
      "menu(friday,five(vichyssoise,green,trout,beef,souffle))",
    ].join("\n");

    const tokens = datasetLexer(input);
    const result = datasetParser(tokens);

    console.log(JSON.stringify(result, null, 2));

    expect(result.type).toBe("DATASET");
    expect(result.children!).toHaveLength(3);

    // Check first menu entry
    const menu1 = result.children![0];
    expect(menu1.type).toBe("FACT");
    expect(menu1.content).toBe("menu(monday,three(calamari,beef,shortcake))");
    expect(menu1.children![0].content).toBe("menu");
    expect(menu1.children![2].content).toBe("monday");

    const menu1Inner = menu1.children![4];
    expect(menu1Inner.type).toBe("COMPOUND_TERM");
    expect(menu1Inner.children![0].content).toBe("three");
    expect(menu1Inner.children![2].content).toBe("calamari");
    expect(menu1Inner.children![4].content).toBe("beef");
    expect(menu1Inner.children![6].content).toBe("shortcake");
  });
});
