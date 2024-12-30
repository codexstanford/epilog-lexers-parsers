import { describe, expect, test } from "bun:test";
import { datasetLexer } from "../dataset-lexer";
import { parseDataset } from "./dataset";

describe("parseDataset", () => {
  test("should parse empty dataset", () => {
    const result = parseDataset(datasetLexer(""));
    expect(result).toEqual({
      type: "DATASET",
      start: 0,
      end: 0,
      line: 1,
      content: "",
      children: [],
    });
  });

  test("should parse single fact dataset", () => {
    const result = parseDataset(datasetLexer("true."));
    expect(result).not.toBeNull();
    expect(result?.type).toBe("DATASET");
    expect(result?.children).toHaveLength(1);
    expect(result?.children?.[0]?.type).toBe("FACT");
    expect(result?.children?.[0]?.content).toBe("true.");
    expect(result?.children?.[0]?.children).toHaveLength(2);
  });

  test("should parse multiple facts dataset", () => {
    const result = parseDataset(datasetLexer("true. false. number(42)."));
    expect(result).not.toBeNull();
    expect(result?.type).toBe("DATASET");
    expect(result?.children).toHaveLength(5);
    expect(result?.children?.[0]?.type).toBe("FACT");
    expect(result?.children?.[1]?.type).toBe("WHITESPACE");
    expect(result?.children?.[2]?.type).toBe("FACT");
    expect(result?.children?.[3]?.type).toBe("WHITESPACE");
    expect(result?.children?.[4]?.type).toBe("FACT");
  });

  test("should parse dataset with whitespace", () => {
    const result = parseDataset(datasetLexer("  true.  \n  false.  "));
    expect(result).not.toBeNull();
    expect(result?.type).toBe("DATASET");
    expect(result?.children).toHaveLength(6);
    expect(result?.children?.[0]?.type).toBe("WHITESPACE");
    expect(result?.children?.[1]?.type).toBe("FACT");
    expect(result?.children?.[2]?.type).toBe("WHITESPACE");
    expect(result?.children?.[3]?.type).toBe("WHITESPACE");
    expect(result?.children?.[4]?.type).toBe("FACT");
    expect(result?.children?.[5]?.type).toBe("WHITESPACE");
  });

  test("should parse complex dataset with nested terms", () => {
    const result = parseDataset(
      datasetLexer(
        [
          "parent(john, mary).",
          "grandparent(john, parent(mary)).",
          'likes("ice cream", 42).',
        ].join("\n")
      )
    );

    expect(result).not.toBeNull();
    expect(result?.type).toBe("DATASET");
    expect(result?.children).toHaveLength(3);
  });

  // from https://github.com/codexstanford/cardinal-care-encoding/blob/main/Encoding/System-wide/world.hdf
  test("should parse cardinal-care-encoding dataset", () => {
    const result = parseDataset(
      datasetLexer(
        [
          "type(medicare_part_a,product)",
          "product.insurer(medicare_part_a,usa)",
          'product.description(medicare_part_a,"https://www.medicare.gov/coverage/inpatient-hospital-care")',
          'product.rulebase(medicare_part_a,"../products/medicare_part_a/library.hrf")',
        ].join("\n")
      )
    );

    expect(result).not.toBeNull();
    expect(result?.type).toBe("DATASET");
    expect(result?.children).toHaveLength(4);

    // Check first fact: type(medicare_part_a,product)
    const fact1 = result?.children?.[0];
    expect(fact1?.type).toBe("FACT");
    expect(fact1?.children).toHaveLength(6); // identifier + ( + term + comma + term + )
    expect(fact1?.children?.[0]?.type).toBe("CONSTANT");
    expect(fact1?.children?.[0]?.content).toBe("type");
    expect(fact1?.children?.[1]?.type).toBe("OPEN_PAREN");
    expect(fact1?.children?.[2]?.type).toBe("TERM");
    expect(fact1?.children?.[2]?.content).toBe("medicare_part_a");
    expect(fact1?.children?.[3]?.type).toBe("COMMA");
    expect(fact1?.children?.[4]?.type).toBe("TERM");
    expect(fact1?.children?.[4]?.content).toBe("product");
    expect(fact1?.children?.[5]?.type).toBe("CLOSE_PAREN");

    // Check third fact: product.description(medicare_part_a,"...")
    const fact3 = result?.children?.[2];
    expect(fact3?.type).toBe("FACT");
    expect(fact3?.children).toHaveLength(6); // identifier + ( + term + comma + term + )
    expect(fact3?.children?.[0]?.content).toBe("product.description");
    expect(fact3?.children?.[0]?.type).toBe("CONSTANT");
    expect(fact3?.children?.[1]?.type).toBe("OPEN_PAREN");
    expect(fact3?.children?.[2]?.type).toBe("TERM");
    expect(fact3?.children?.[2]?.content).toBe("medicare_part_a");
    expect(fact3?.children?.[3]?.type).toBe("COMMA");
    expect(fact3?.children?.[4]?.type).toBe("TERM");
    expect(fact3?.children?.[4]?.content).toBe(
      '"https://www.medicare.gov/coverage/inpatient-hospital-care"'
    );
    expect(fact3?.children?.[4]?.children?.[0].type).toBe("CONSTANT_TERM");
    expect(fact3?.children?.[4]?.children?.[0].children?.[0].type).toBe(
      "STRING"
    );
    expect(fact3?.children?.[5]?.type).toBe("CLOSE_PAREN");
  });

  test("should handle invalid dataset gracefully", () => {
    const result = parseDataset(datasetLexer("true. invalid? false."));

    expect(result).not.toBeNull();
    expect(result?.type).toBe("DATASET");
    expect(result?.children?.[result.children.length - 1].type).toBe("ERROR");
  });

  test("should continue with next line after invalid line", () => {
    const result = parseDataset(
      datasetLexer(["true. invalid? false.", "true."].join("\n"))
    );

    expect(result).not.toBeNull();
    expect(result?.type).toBe("DATASET");
    expect(result?.children?.[result.children.length - 2].type).toBe("ERROR");
    expect(result?.children?.[result.children.length - 1].type).toBe("FACT");
  });
});
