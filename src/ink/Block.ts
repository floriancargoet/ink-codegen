import { stringify } from "../utils.js";

import { Base } from "./Base.js";
import { RawCode } from "./RawCode.js";
import { Statement } from "./Statement.js";

export type BlockContent = Statement | RawCode | BlockEmptyLine;
export type Blocky = Block | Array<BlockContent>;

const blockEmptyBrand = Symbol("BlockEmptyLine");
// Special class to insert an empty line in a block
class BlockEmptyLine extends Base {
  private readonly _brand = blockEmptyBrand;
  toString() {
    return "\n";
  }
}

const blockBrand = Symbol("Block");

export class Block extends Base {
  private readonly _brand = blockBrand;

  items: Array<BlockContent>;

  constructor(...items: Array<BlockContent>) {
    super();
    this.items = items;
  }

  get length() {
    return this.items.length;
  }

  add(...items: Array<BlockContent>) {
    this.items.push(...items);
  }

  addEmptyLine() {
    // Only add if not already one
    if (!(this.items.at(-1) instanceof BlockEmptyLine)) {
      this.add(new BlockEmptyLine());
    }
  }

  toString() {
    // No BlockEmptyLine at the end
    if (this.items.at(-1) instanceof BlockEmptyLine) {
      this.items.pop();
    }
    return stringify(this.items);
  }
}
