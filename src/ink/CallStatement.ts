import { ArgumentList } from "./ArgumentList.js";
import { Statement } from "./Statement.js";

export type Callable = { name: string };

const brand = Symbol("CallStatement");

export class CallStatement extends Statement {
  private readonly _brand = brand;

  callable: Callable; // TODO: External
  arguments?: ArgumentList;

  // FIXME: handle `knot.stitch()` syntax.
  constructor({ callable, args }: { callable: Callable; args?: ArgumentList }) {
    super();
    this.callable = callable;
    this.arguments = args;
  }

  toString() {
    return `${this.callable.name}(${this.arguments?.toString() ?? ""})`;
  }
}
