import { Base } from "./Base.js";

export type ParameterConfig = {
  name: string;
  ref?: boolean;
  divert?: boolean;
};

const parameterBrand = Symbol("Param");

export class Parameter extends Base {
  private readonly _brand = parameterBrand;

  name: string;
  ref?: boolean;
  divert?: boolean;
  constructor({ name, ref, divert }: ParameterConfig) {
    super();
    this.name = name;
    this.ref = ref;
    this.divert = divert;
  }

  toString() {
    if (this.divert) return `-> ${this.name}`;
    if (this.ref) return `ref ${this.name}`;
    return this.name;
  }
}

type ToStringOptions = {
  parensMode?: "never" | "always" | "if-needed";
};
const parameterListBrand = Symbol("ParameterList");

export class ParameterList extends Base {
  private readonly _brand = parameterListBrand;

  parameters: Array<Parameter>;

  constructor(parameters: ParameterList["parameters"]) {
    super();
    this.parameters = parameters;
  }

  toString({ parensMode = "never" }: ToStringOptions = {}) {
    const str = this.parameters.join(", ");
    switch (parensMode) {
      case "never":
        return str;
      case "always":
        return `(${str})`;
      case "if-needed": {
        if (str.length === 0) return "";
        else return `(${str})`;
      }
    }
  }
}
