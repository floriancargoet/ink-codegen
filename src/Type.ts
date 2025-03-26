import { pluralize } from "inflection";

import { Instance, InstanceConfig } from "./Instance.js";
import { ArgumentConfig, t } from "./ink/Factory.js";
import { ParameterConfig } from "./ink/ParameterList.js";
import { Reference } from "./ink/Reference.js";
import { Statement } from "./ink/Statement.js";
import { SwitchStatement } from "./ink/SwitchStatement.js";
import { JSValueType, PrimitiveType, Value } from "./ink/Value.js";

export type TypeConfig<T extends PrimitiveType> = {
  name: string;
  pluralName?: string;
  attributes?: Array<AttributeDefinition<T>>;
};

export type AttributeDefinition<T extends PrimitiveType> =
  | {
      type: T;
      name: string;
      constant?: boolean;
      default?: JSValueType<T>;
    }
  | {
      type: "knot";
      name: string;
      constant?: boolean;
      default?: string;
    };

export class Type<T extends PrimitiveType> {
  name: string;
  pluralName: string;
  attributes?: Array<AttributeDefinition<T>>;
  instances: Array<Instance<T>> = [];

  constructor(config: TypeConfig<T>) {
    this.name = config.name;
    this.pluralName = config.pluralName ?? pluralize(this.name);
    this.attributes = config.attributes;
  }

  create(config: InstanceConfig) {
    const inst = new Instance(this, config);
    this.instances.push(inst);
    return inst;
  }

  generateList() {
    if (this.instances.length === 0) return null;
    const itemNames = this.instances.map((i) => i.itemName);
    return t.list(this.pluralName, itemNames);
  }

  getVarName(inst: Instance<T>, attr: AttributeDefinition<T>) {
    return `${inst.itemName}_${attr.name}`;
  }

  getInstValue(inst: Instance<T>, attr: AttributeDefinition<T>): Value<T> | Reference | undefined {
    // We trust the inst to be correctly set up, we can't verify that with types.
    const value = inst.attributes?.[attr.name] as JSValueType<T> | undefined;
    if (!value) return;
    if (attr.type === "knot") return new Reference({ name: String(value), divert: true });
    return new Value(attr.type, value);
  }

  getVarValue(inst: Instance<T>, attr: AttributeDefinition<T>) {
    let value: Value<T> | Reference | undefined;
    value = this.getInstValue(inst, attr);
    if (value == null && attr.default) {
      if (attr.type === "knot") value = new Reference({ name: String(attr.default), divert: true });
      else value = new Value(attr.type, attr.default as JSValueType<T>);
    }

    if (value == null) value = defaultForAttribute(attr);
    return value;
  }

  generateAttributeVariables() {
    if (this.instances.length === 0) return null;
    if (this.attributes == null || this.attributes.length === 0) return null;

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
    return `define_${this.name.toLowerCase()}`;
  }

  generateDefineFunction() {
    if (this.attributes == null || this.attributes.length === 0) return null;

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
    if (this.attributes == null || this.attributes.length === 0) return null;

    const fnName = this.getDefineFnName();
    for (const inst of this.instances) {
      const attributeArgs = this.attributes.map<ArgumentConfig>((a) => {
        if (a.constant) {
          return this.getVarValue(inst, a);
        }
        return new Reference({ name: this.getVarName(inst, a) });
      });
      const call = t.call({ name: fnName }, ["op", "value", ...attributeArgs]).toString();
      dbSwitch.addCase(
        new Reference({ name: inst.itemName }),
        t.block([t.code(`~ return ${call}`)]),
      );
    }
    return dbSwitch;
  }
}

export function defaultForAttribute<T extends PrimitiveType>({
  type,
}: AttributeDefinition<T>): Value<T> | Reference {
  switch (type) {
    case "boolean":
      return new Value(type, false as JSValueType<T>);
    case "integer":
      return new Value(type, 0 as JSValueType<T>);
    case "string":
      return new Value(type, "" as JSValueType<T>);
    case "knot":
      return new Reference({ name: "null_knot", divert: true }); // FIXME: Generate it
  }
}
