import { Statement } from "./Statement.js";

const brand = Symbol("ListDeclaration");

export class ListDeclaration extends Statement {
  private readonly _brand = brand;

  name: string;
  items: Array<string>; // FIXME full syntax

  constructor(name: string, items?: Array<string>) {
    super();
    this.name = name;
    this.items = items ?? [];
  }

  addItem(name: string) {
    this.items.push(name);
  }

  toString() {
    if (this.items.length === 0) {
      console.warn("Empty list", this.name);
      return "";
    }
    return `LIST ${this.name} = ${this.items.join(", ")}\n`;
  }
}
