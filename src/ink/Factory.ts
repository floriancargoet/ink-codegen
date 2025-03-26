import { ArgumentList } from "./ArgumentList.js";
import { Block, Blocky } from "./Block.js";
import { Callable, CallStatement } from "./CallStatement.js";
import { KnotLike } from "./KnotLike.js";
import { ListDeclaration } from "./ListDeclaration.js";
import { Parameter, ParameterConfig, ParameterList } from "./ParameterList.js";
import { RawCode } from "./RawCode.js";
import { ReferenceConfig, Reference } from "./Reference.js";
import { Statement } from "./Statement.js";
import { SwitchStatement } from "./SwitchStatement.js";
import { PrimitiveType, Value } from "./Value.js";
import { VarDeclaration } from "./VarDeclaration.js";

export type ParametersConfig = Array<string | ParameterConfig | Parameter>;
export type ArgumentConfig = ReferenceConfig | Reference | Value<PrimitiveType>;
export type ArgumentsConfig = Array<string | ArgumentConfig>;

class Factory {
  code(code: string) {
    return new RawCode(code);
  }

  ref(nameOrRef: string | Reference, divert?: boolean) {
    if (nameOrRef instanceof Reference) {
      return nameOrRef;
    }
    return new Reference({ name: nameOrRef, divert });
  }

  switch(ref: string | Reference) {
    return new SwitchStatement(t.ref(ref));
  }

  var<T extends PrimitiveType>(name: string, value: Reference | Value<T>) {
    return new VarDeclaration(name, value);
  }

  list(name: string, items: Array<string>) {
    return new ListDeclaration(name, items);
  }

  call(callable: Callable, argums?: ArgumentsConfig | ArgumentList) {
    const args = t.args(argums);
    return new CallStatement({ callable, args });
  }

  knot(
    name: string,
    params?: ParametersConfig | ParameterList,
    body?: Array<Statement | RawCode> | Block,
  ) {
    const parameters = t.parameters(params);
    return new KnotLike({
      type: "knot",
      name,
      parameters,
      body: t.block(body),
    });
  }

  block(block?: Blocky) {
    if (block == null) return new Block();
    if (block instanceof Block) return block;
    return new Block(...block);
  }

  function(name: string, params?: ParametersConfig | ParameterList, body?: Blocky) {
    return new KnotLike({
      type: "function",
      name,
      parameters: t.parameters(params),
      body: t.block(body),
    });
  }

  parameters(params?: ParametersConfig | ParameterList) {
    if (params == null || params instanceof ParameterList) return params;

    const parameters = params.map((p) => {
      if (p instanceof Parameter) return p;
      if (typeof p === "string") return new Parameter({ name: p });
      return new Parameter(p);
    });
    return new ParameterList(parameters);
  }

  args(argums?: ArgumentsConfig | ArgumentList) {
    if (argums == null || argums instanceof ArgumentList) return argums;

    const args = argums.map((p) => {
      if (p instanceof Value || p instanceof Reference) {
        return p;
      }
      if (typeof p === "string") {
        return new Reference({ name: p });
      }
      // ReferenceConfig
      return new Reference(p);
    });
    return new ArgumentList(args);
  }
}

export const t = new Factory();
