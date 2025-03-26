import { Block } from "./Block.js";
import { IncludeStatement } from "./IncludeStatement.js";
import { RawCode } from "./RawCode.js";

describe("Block", () => {
  test("it joins", () => {
    const block = new Block(new IncludeStatement("plop"));
    block.add(new RawCode("plip"));
    block.add(new RawCode("plap"));

    expect(block.toString()).toBe("INCLUDE plop\nplipplap");
  });

  test("empty block is ''", () => {
    const block = new Block();

    expect(block.toString()).toBe("");
  });

  test("only one empty line", () => {
    const block = new Block();

    block.add(new IncludeStatement("plop"));
    block.addEmptyLine();
    block.addEmptyLine();
    block.addEmptyLine();
    block.addEmptyLine();
    block.add(new IncludeStatement("plop"));

    expect(block.toString()).toBe("INCLUDE plop\n\nINCLUDE plop\n");
  });

  test("no empty line at the end", () => {
    const block = new Block();

    block.add(new IncludeStatement("plop"));
    block.addEmptyLine();
    block.add(new IncludeStatement("plop"));
    block.addEmptyLine();

    expect(block.toString()).toBe("INCLUDE plop\n\nINCLUDE plop\n");
  });
});
