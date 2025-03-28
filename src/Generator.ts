import { DefaultAttributeConfig } from "./Instance.js";
import { Relation } from "./Relation.js";
import { Type } from "./Type.js";
import { t } from "./ink/Factory.js";
import { InkFile } from "./ink/InkFile.js";
import { Reference } from "./ink/Reference.js";
import { SwitchStatement } from "./ink/SwitchStatement.js";
import { u } from "./u.js";

function compactMap<T, U>(list: Array<T>, fn: (t: T) => U | Array<U> | null) {
  return list.flatMap(fn).filter((x) => x != null);
}

export class Generator {
  types: Array<Type> = [];
  relations: Array<Relation> = [];
  file = new InkFile();
  helpers: Array<{ type: "get" | "set"; attrName: string; fnName: string }> = [];

  type(...params: ConstructorParameters<typeof Type>) {
    const type = new Type(...params);
    this.types.push(type);
    return type;
  }

  relation<R extends DefaultAttributeConfig, L extends DefaultAttributeConfig>(
    ...params: ConstructorParameters<typeof Relation<R, L>>
  ) {
    const r = new Relation(...params);
    this.relations.push(r);
    return r;
  }

  generate() {
    const types = this.types.filter((type) => {
      if (type.instances.length === 0) {
        console.warn(`Type ${type.name} has no instances.`);
        return false;
      }
      return true;
    });

    this.file.implicitKnot.add(...compactMap(types, (type) => type.generateList()));
    this.file.implicitKnot.addEmptyLine(); // Line between LISTs and VARs
    this.file.implicitKnot.add(...compactMap(types, (type) => type.generateAttributeVariables()));

    this.generateRelationList();
    this.file.implicitKnot.addEmptyLine(); // Line between LIST & initial
    this.file.implicitKnot.add(...compactMap(this.relations, (r) => r.generateInitialRelations()));
    this.generateRelationsDatabase();

    this.generateDatabaseFunction(types);
    this.file.knots.push(...compactMap(types, (type) => type.generateDefineFunction()));

    for (const { type, attrName, fnName } of this.helpers) {
      this.generateDatabaseHelper(type, attrName, fnName);
    }
    return this.file.toString();
  }

  generateDatabaseFunction(types: Array<Type>) {
    const dbSwitch = new SwitchStatement(new Reference({ name: "object" }));
    for (const type of types) {
      type.generateDatabaseLines(dbSwitch);
    }
    if (dbSwitch.cases.length === 0) return null;
    this.file.function("database", ["op", "object", "value"], [dbSwitch]);
  }

  generateRelationList() {
    if (this.relations.length === 0) return null;

    const relNames = this.relations.map((r) => r.name);
    this.file.implicitKnot.add(t.list("Relations", relNames));
  }

  generateRelationsDatabase() {
    if (this.relations.length === 0) return null;

    const leftRightFunc = this.file.function(
      "left_right",
      ["left", "left_list", "right_list"],
      [
        t.code(u`
          { left:
            ~ return left_list
          - else:
            ~ return right_list
          }
        `),
      ],
    );
    const relDbSwitch = new SwitchStatement(new Reference({ name: "relation" }));
    for (const rel of this.relations) {
      const call = t.call(leftRightFunc, ["left", rel.left.name, rel.right.name]);
      relDbSwitch.addCase(
        new Reference({ name: rel.name }),
        t.block([t.code(`~ return ${call.toString()}`)]),
      );
    }
    if (relDbSwitch.cases.length === 0) return null;
    this.file.function("relationDatabase", ["relation", "left"], [relDbSwitch]);
  }

  addDatabaseHelper(type: "get" | "set", attrName: string, fnName?: string) {
    this.helpers.push({ type, attrName, fnName: fnName ?? `${type}_${attrName}` });
  }

  generateDatabaseHelper(type: "get" | "set", attrName: string, fnName: string) {
    const op = t.val("string", `${type}_${attrName}`);
    const params = type === "get" ? ["object"] : ["object", attrName];
    const args = type === "get" ? [op, "object", t.val("string", "")] : [op, "object", attrName];
    this.file.function(fnName, params, [t.code(`~ return ${t.call("database", args).toString()}`)]);
  }
}
