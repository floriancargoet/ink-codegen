import { Type } from "./Type.js";

export type DefaultAttributeConfig = object;

export class Instance<AttributeConfig extends DefaultAttributeConfig = DefaultAttributeConfig> {
  type: Type<AttributeConfig>;
  itemName: string;
  attributes: AttributeConfig;

  constructor(type: Type<AttributeConfig>, itemName: string, attributes?: AttributeConfig) {
    this.type = type;
    this.itemName = itemName;
    this.attributes = attributes ?? ({} as AttributeConfig);
  }
}
