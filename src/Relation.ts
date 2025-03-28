import { DefaultAttributeConfig, Instance } from "./Instance.js";
import { Type } from "./Type.js";
import { Block } from "./ink/Block.js";
import { t } from "./ink/Factory.js";

export class Relation<
  Left extends DefaultAttributeConfig = DefaultAttributeConfig,
  Right extends DefaultAttributeConfig = DefaultAttributeConfig,
> {
  name: string;
  left: Type<Left>;
  right: Type<Right>;

  links: Array<[Instance<Left>, Instance<Right>]> = [];

  constructor(name: string, left: Type<Left>, right: Type<Right>) {
    this.name = name;
    this.left = left;
    this.right = right;
  }

  relate(left: Instance<Left>, right: Instance<Right>) {
    this.links.push([left, right]);
  }

  generateInitialRelations() {
    if (this.links.length === 0) return null;
    const block = new Block();
    for (const [left, right] of this.links) {
      block.add(t.code(`~ relate(${left.itemName}, ${this.name}, ${right.itemName})\n`));
    }
    return block;
  }
}
