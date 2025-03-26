import { ensureOneNewLineAtEnd, stringify } from "../utils.js";

import { Blocky } from "./Block.js";
import { ParametersConfig, t } from "./Factory.js";
import { IncludeStatement } from "./IncludeStatement.js";
import { KnotLike } from "./KnotLike.js";
import { ParameterList } from "./ParameterList.js";

const brand = Symbol("InkFile");

export class InkFile {
  private readonly _brand = brand;

  includes: Array<IncludeStatement> = [];
  knots: Array<KnotLike> = [];
  implicitKnot: KnotLike;

  constructor() {
    this.implicitKnot = t.knot("");
  }

  include(path: string) {
    this.includes.push(new IncludeStatement(path));
  }

  knot(name: string, params?: ParametersConfig | ParameterList, body?: Blocky) {
    const knot = t.knot(name, params, body);
    this.knots.push(knot);
    return knot;
  }

  function(name: string, params?: ParametersConfig | ParameterList, body?: Blocky) {
    const func = t.function(name, params, body);
    this.knots.push(func);
    return func;
  }

  toString() {
    const sources: Array<string> = [];
    if (this.includes.length > 0) {
      sources.push(ensureOneNewLineAtEnd(stringify(this.includes)));
    }

    if (this.implicitKnot.body.length > 0) {
      sources.push(ensureOneNewLineAtEnd(stringify(this.implicitKnot)));
    }

    for (const knot of this.knots) {
      sources.push(ensureOneNewLineAtEnd(stringify(knot)));
    }

    return sources.join("\n");
  }
}
