export interface Schema {
  models: Model[];
  enums: Enum[];
  datasource: Datasource;
  generator: Generator;
}

export interface Model {
  id: string;
  name: string;
  fields: Field[];
  attributes: ModelAttribute[];
}

export interface Field {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  isList: boolean;
  attributes: Attribute[];
}

export interface Attribute {
  name: string;
  arguments: AttributeArgument[];
}

export interface AttributeArgument {
  name: string;
  value: string;
  isExpression?: boolean;
}

export interface ModelAttribute {
  type: string;          // id, unique, index, map, ignore, fulltext
  arguments: ModelAttributeArgument[];
}

export interface ModelAttributeArgument {
  name: string;          // fields, name, map, type, clustered, etc.
  value: string;
  isExpression?: boolean;
}

export interface Enum {
  id: string;
  name: string;
  values: string[];
}

export interface Datasource {
  provider: string;
  url: string;
}

export interface Generator {
  provider: string;
  output?: string;
  previewFeatures?: string[];
  binaryTargets?: string[];
}

export interface RelationField {
  fieldName: string;
  fieldType: string;
}
