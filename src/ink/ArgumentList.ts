import { Base } from "./Base.js";
import { Reference } from "./Reference.js";
import { Value, PrimitiveType } from "./Value.js";

const brand = Symbol("ArgumentList");

export class ArgumentList extends Base {
  private readonly _brand = brand;

  arguments: Array<Reference | Value<PrimitiveType>> = [];

  constructor(args: ArgumentList["arguments"]) {
    super();
    this.arguments = args;
  }

  toString() {
    return this.arguments.map((a) => a.toString()).join(", ");
  }
}
