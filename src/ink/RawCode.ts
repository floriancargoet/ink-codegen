import { Base } from "./Base.js";

const brand = Symbol("RawCode");

export class RawCode extends Base {
  private readonly _brand = brand;

  code: string;

  constructor(code: string) {
    super();
    this.code = code;
  }

  toString() {
    return this.code;
  }
}
