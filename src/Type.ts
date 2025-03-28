import { pluralize } from "inflection";

import { DefaultAttributeConfig, Instance } from "./Instance.js";
import { ArgumentConfig, t } from "./ink/Factory.js";
import { ParameterConfig } from "./ink/ParameterList.js";
import { Reference } from "./ink/Reference.js";
import { Statement } from "./ink/Statement.js";
import { SwitchStatement } from "./ink/SwitchStatement.js";
import { JSValueType, PrimitiveType, Value } from "./ink/Value.js";

export type TypeConfig = {
  name: string;
  pluralName?: string;
};

type AttrType = PrimitiveType | "divert" | "reference";

type WithAttr<T extends AttrType, N extends string, C extends boolean> = C extends true
  ? { [k in N]: JSValueType<T> }
  : { [k in N]?: JSValueType<T> };

export type AttributeDefinition<T extends AttrType, N extends string, C extends boolean> = {
  type: T;
  name: N;
  constant?: C;
  default?: JSValueType<T>;
};

export type Simplify<T> = {} & { [P in keyof T]: T[P] };

export class Type<AttributeConfig extends DefaultAttributeConfig = DefaultAttributeConfig> {
  name: string;
  pluralName: string;
  attributes: Array<AttributeDefinition<AttrType, string, boolean>> = [];
  instances: Array<Instance<AttributeConfig>> = [];

  constructor(nameOrConfig: string | TypeConfig) {
    const config = typeof nameOrConfig === "string" ? { name: nameOrConfig } : nameOrConfig;

    this.name = config.name;
    this.pluralName = config.pluralName ?? pluralize(this.name);
  }

  attr<T extends AttrType, N extends string, C extends boolean>(
    attrDef: AttributeDefinition<T, N, C>,
  ) {
    this.attributes.push(attrDef);
    return this as Type<Simplify<AttributeConfig & WithAttr<T, N, C>>>;
  }

  create(itemName: string, attrs?: AttributeConfig) {
    const inst = new Instance(this, itemName, attrs);
    this.instances.push(inst);
    return inst;
  }

  generateList() {
    if (this.instances.length === 0) return null;
    const itemNames = this.instances.map((i) => i.itemName);
    return t.list(this.pluralName, itemNames);
  }

  getVarName(
    inst: Instance<AttributeConfig>,
    attr: AttributeDefinition<AttrType, string, boolean>,
  ) {
    return `${inst.itemName}_${attr.name}`;
  }

  getInstValue<T extends AttrType, N extends string, C extends boolean>(
    inst: Instance<WithAttr<T, N, C>>,
    attr: AttributeDefinition<T, N, C>,
  ) {
    // We trust the inst to be correctly set up, we can't verify that with types.
    const value = inst.attributes[attr.name]; // as JSValueType<T> | undefined;
    if (!value) return;
    if (attr.type === "divert") return new Reference({ name: String(value), divert: true });
    if (attr.type === "reference") return new Reference({ name: String(value) });
    return new Value(attr.type, value);
  }

  getVarValue<T extends AttrType, N extends string, C extends boolean>(
    inst: Instance<WithAttr<T, N, C>>,
    attr: AttributeDefinition<T, N, C>,
  ) {
    let value = this.getInstValue(inst, attr);
    if (value == null && attr.default) {
      if (attr.type === "divert") {
        value = new Reference({ name: String(attr.default), divert: true });
      } else if (attr.type === "reference") {
        value = new Reference({ name: String(attr.default) });
      } else value = new Value(attr.type, attr.default as JSValueType<T>);
    }

    return value ?? defaultForAttribute(attr);
  }

  generateAttributeVariables() {
    if (this.instances.length === 0) return null;
    if (this.attributes.length === 0) return null;

    const statements: Array<Statement> = [];
    for (const inst of this.instances) {
      for (const attr of this.attributes) {
        if (!attr.constant) {
          const varName = this.getVarName(inst, attr);
          const varValue = this.getVarValue(inst, attr);
          statements.push(t.var(varName, varValue));
        }
      }
    }
    return statements;
  }

  getDefineFnName() {
    return `get_set_${this.name.toLowerCase()}`;
  }

  generateDefineFunction() {
    if (this.attributes.length === 0) return null;

    const defineSwitch = new SwitchStatement(new Reference({ name: "op" }));
    for (const attr of this.attributes) {
      defineSwitch.addCase(
        new Value("string", `get_${attr.name}`),
        t.block([t.code(`~ return ${attr.name}`)]),
      );
      if (!attr.constant) {
        defineSwitch.addCase(
          new Value("string", `set_${attr.name}`),
          t.block([t.code(`~ ${attr.name} = value`)]),
        );
      }
    }
    const fnName = this.getDefineFnName();
    const attributeParams = this.attributes.map<ParameterConfig>((a) => ({
      name: a.name,
      // We want it to be a ref, not a divert
      // divert: a.type === "knot",
      ref: !a.constant,
    }));
    return t.function(fnName, ["op", "value", ...attributeParams], [defineSwitch]);
  }

  generateDatabaseLines(dbSwitch: SwitchStatement) {
    if (this.attributes.length === 0) return null;

    const fnName = this.getDefineFnName();
    for (const inst of this.instances) {
      const attributeArgs = this.attributes.map<ArgumentConfig>((a) => {
        if (a.constant) {
          return this.getVarValue(inst, a);
        }
        return new Reference({ name: this.getVarName(inst, a) });
      });
      const call = t.call(fnName, ["op", "value", ...attributeArgs]).toString();
      dbSwitch.addCase(
        new Reference({ name: inst.itemName }),
        t.block([t.code(`~ return ${call}`)]),
      );
    }
    return dbSwitch;
  }
}

export function defaultForAttribute<T extends AttrType>({
  type,
}: AttributeDefinition<T, string, boolean>) {
  switch (type) {
    case "boolean":
      return new Value(type, false);
    case "integer":
      return new Value(type, 0);
    case "string":
      return new Value(type, "");
    case "reference":
      return new Reference({ name: "InvalidDefaultRef" });
    case "divert":
      return new Reference({ name: "null_knot", divert: true }); // FIXME: Generate it
  }
}
