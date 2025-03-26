import { Statement } from "./Statement.js";

const brand = Symbol("IncludeStatement");

export class IncludeStatement extends Statement {
  private readonly _brand = brand;

  path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }

  toString() {
    return `INCLUDE ${this.path}\n`;
  }
}
