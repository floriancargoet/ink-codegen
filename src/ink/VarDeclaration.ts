import { Reference } from "./Reference.js";
import { Statement } from "./Statement.js";
import { PrimitiveType, Value } from "./Value.js";

const brand = Symbol("VarDeclaration");

export class VarDeclaration<T extends PrimitiveType> extends Statement {
  private readonly _brand = brand;

  name: string;
  value: Value<T> | Reference; // TODO: dedicated Divert type?

  constructor(name: string, value: Value<T> | Reference) {
    super();
    this.name = name;
    this.value = value;
  }

  toString() {
    return `VAR ${this.name} = ${String(this.value)}\n`;
  }
}
