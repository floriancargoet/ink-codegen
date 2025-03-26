import { Type } from "./Type.js";
import { PrimitiveType } from "./ink/Value.js";

export type InstanceConfig = {
  itemName: string;
  attributes?: Record<string, string | number>;
};

export class Instance<T extends PrimitiveType> {
  type: Type<T>;
  itemName: string;
  attributes?: Record<string, string | number>;
  constructor(type: Type<T>, { itemName, attributes }: InstanceConfig) {
    this.type = type;
    this.itemName = itemName;
    this.attributes = attributes;
  }
}
