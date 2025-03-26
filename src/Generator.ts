import { Relation } from "./Relation.js";
import { Type, TypeConfig } from "./Type.js";
import { t } from "./ink/Factory.js";
import { InkFile } from "./ink/InkFile.js";
import { Reference } from "./ink/Reference.js";
import { SwitchStatement } from "./ink/SwitchStatement.js";
import { PrimitiveType } from "./ink/Value.js";
import { u } from "./u.js";

function compactMap<T, U>(list: Array<T>, fn: (t: T) => U | Array<U> | null) {
  return list.flatMap(fn).filter((x) => x != null);
}

export class Generator {
  types: Array<Type<PrimitiveType>> = [];
  relations: Array<Relation<PrimitiveType, PrimitiveType>> = [];

  type<T extends PrimitiveType>(config: TypeConfig<T>) {
    const type = new Type(config);
    this.types.push(type);
    return type;
  }

  relation(relName: string, leftType: Type<PrimitiveType>, rightType: Type<PrimitiveType>) {
    const r = new Relation(relName, leftType, rightType);
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

    const file = new InkFile();
    file.implicitKnot.add(...compactMap(types, (type) => type.generateList()));
    file.implicitKnot.addEmptyLine(); // Line between LISTs and VARs
    file.implicitKnot.add(...compactMap(types, (type) => type.generateAttributeVariables()));

    this.generateRelationList(file);
    file.implicitKnot.addEmptyLine(); // Line between LIST & initial
    file.implicitKnot.add(...compactMap(this.relations, (r) => r.generateInitialRelations()));
    this.generateRelationsDatabase(file);

    this.generateDatabaseFunction(file, types);
    file.knots.push(...compactMap(types, (type) => type.generateDefineFunction()));

    return file.toString();
  }

  generateDatabaseFunction(file: InkFile, types: Array<Type<PrimitiveType>>) {
    const dbSwitch = new SwitchStatement(new Reference({ name: "object" }));
    for (const type of types) {
      type.generateDatabaseLines(dbSwitch);
    }
    if (dbSwitch.cases.length === 0) return null;
    file.function("database", ["op", "object", "value"], [dbSwitch]);
  }

  generateRelationList(file: InkFile) {
    if (this.relations.length === 0) return null;

    const relNames = this.relations.map((r) => r.name);
    file.implicitKnot.add(t.list("Relations", relNames));
  }

  generateRelationsDatabase(file: InkFile) {
    if (this.relations.length === 0) return null;

    const leftRightFunc = file.function(
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
    file.function("relationDatabase", ["relation", "left"], [relDbSwitch]);
  }
}
