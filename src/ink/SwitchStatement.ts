import { u } from "../u.js";

import { Block } from "./Block.js";
import { Reference } from "./Reference.js";
import { Statement } from "./Statement.js";
import { PrimitiveType, Value } from "./Value.js";

const brand = Symbol("SwitchStatement");

export class SwitchStatement extends Statement {
  private readonly _brand = brand;

  variable: Reference; // FIXME: expression
  cases: Array<{
    value: Reference | Value<PrimitiveType>;
    then: Block;
  }> = [];
  else: Block | null = null;

  constructor(variable: Reference) {
    super();
    this.variable = variable;
  }

  addCase(value: Reference | Value<PrimitiveType>, then: Block) {
    this.cases.push({ value, then });
    return this;
  }

  addElse(elseBlock: Block) {
    this.else = elseBlock;
    return this;
  }

  toString() {
    return u`
      { ${this.variable}:
      ${this.cases.map(
        (c) => u`
        - ${c.value}: ${c.then}
      `,
      )}${
        this.else &&
        u`
          - else: ${this.else}
        `
      }}
    `;
  }
}
