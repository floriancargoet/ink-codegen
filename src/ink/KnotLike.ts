import { ensureOneNewLineAtEnd } from "../utils.js";

import { Base } from "./Base.js";
import { Block, BlockContent } from "./Block.js";
import { ParameterList } from "./ParameterList.js";

const prefixes = {
  knot: "===",
  stitch: "=",
  function: "=== function",
};

type KnotLikeType = "knot" | "stitch" | "function";
const brand = Symbol("KnotLike");

export class KnotLike extends Base {
  private readonly _brand = brand;

  type: KnotLikeType;
  name: string;
  parameters?: ParameterList;
  body: Block;

  constructor({
    type,
    name,
    parameters,
    body,
  }: {
    type: KnotLikeType;
    name: string;
    parameters?: ParameterList;
    body?: Block;
  }) {
    super();
    this.type = type;
    this.name = name;
    this.parameters = parameters;
    this.body = body ?? new Block();
  }

  add(...statements: Array<BlockContent>) {
    this.body.add(...statements);
  }

  addEmptyLine() {
    this.body.addEmptyLine();
  }

  toString() {
    let source = "";
    // Special case for implicit knot
    if (this.name === "") {
      source = String(this.body);
    } else {
      const prefix = prefixes[this.type];
      const paramParens =
        this.parameters?.toString({
          parensMode: this.type === "function" ? "always" : "if-needed",
        }) ?? "";
      source = `${prefix} ${this.name}${paramParens}\n${String(this.body)}`;
    }

    return ensureOneNewLineAtEnd(source);
  }
}
