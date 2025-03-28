import { Base } from "./Base.js";

export type PrimitiveType = "string" | "integer" | "boolean";
export type JSValueType<T extends PrimitiveType | "divert" | "reference"> = T extends
  | "string"
  | "divert"
  | "reference"
  ? string
  : T extends "boolean"
    ? boolean
    : T extends "integer"
      ? number
      : never;

const brand = Symbol("Value");

export class Value<T extends PrimitiveType> extends Base {
  private readonly _brand = brand;

  type: T;
  value: JSValueType<T>;
  constructor(type: T, value: JSValueType<T>) {
    super();
    this.type = type;
    this.value = value;
  }

  toString() {
    return JSON.stringify(this.value);
  }
}
