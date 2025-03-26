import { Base } from "./Base.js";

export type ReferenceConfig = {
  name: string;
  divert?: boolean;
};

const brand = Symbol("Reference");

export class Reference extends Base {
  private readonly _brand = brand;

  // FIXME: knot.stitch reference
  name: string;
  divert?: boolean;

  constructor({ name, divert }: ReferenceConfig) {
    super();
    this.name = name;
    this.divert = divert;
  }

  toString() {
    if (this.divert) return `-> ${this.name}`;
    return this.name;
  }
}
