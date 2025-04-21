import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash, ArrowDown, ArrowUp, Code } from "lucide-react";
import { Model, Field, Enum, Attribute, ModelAttribute } from "@/types/schema";
import { cn } from "@/lib/utils";
import { generateModelCode } from "@/utils/schemaGenerator";

interface ModelEditorProps {
  model: Model;
  allModels: Model[];
  allEnums: Enum[];
  onUpdateModel: (updatedModel: Model) => void;
}

const SCALAR_TYPES = [
  "String",
  "Boolean",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "DateTime",
  "Json",
  "Bytes",
];

const FIELD_ATTRIBUTES = [
  { value: "id", label: "@id", description: "Primary key" },
  { value: "unique", label: "@unique", description: "Unique constraint" },
  { value: "default", label: "@default", description: "Default value" },
  { value: "relation", label: "@relation", description: "Relation settings" },
  { value: "map", label: "@map", description: "Map to DB column name" },
  { value: "updatedAt", label: "@updatedAt", description: "Auto-updated timestamp" },
  { value: "db", label: "@db", description: "Database type" },
  { value: "ignore", label: "@ignore", description: "Exclude field from Prisma Client" },
];

const MODEL_ATTRIBUTES = [
  { value: "map", label: "@@map", description: "Map to DB table name" },
  { value: "id", label: "@@id", description: "Composite primary key" },
  { value: "unique", label: "@@unique", description: "Multi-field unique constraint" },
  { value: "index", label: "@@index", description: "Multi-field index" },
  { value: "ignore", label: "@@ignore", description: "Exclude model from Prisma Client" },
  { value: "fulltext", label: "@@fulltext", description: "Full-text search index (MongoDB, MySQL)" },
];

const DEFAULT_PROVIDERS = [
  { value: "auto()", label: "auto()" },
  { value: "autoincrement()", label: "autoincrement()" },
  { value: "cuid()", label: "cuid()" },
  { value: "uuid()", label: "uuid()" },
  { value: "now()", label: "now()" },
];

const ON_DELETE_ACTIONS = [
  "Cascade",
  "Restrict",
  "NoAction",
  "SetNull",
  "SetDefault",
];

const ModelEditor = ({ model, allModels, allEnums, onUpdateModel }: ModelEditorProps) => {
  const [expandedFields, setExpandedFields] = useState<string[]>([]);
  const [modelCodeView, setModelCodeView] = useState(false);
  const modelCode = generateModelCode(model);

  const updateModelName = (name: string) => {
    onUpdateModel({ ...model, name });
  };

  const addField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: `field${model.fields.length + 1}`,
      type: "String",
      isRequired: true,
      isList: false,
      attributes: [],
    };
    
    // Add field to the top and auto-expand it
    const updatedFields = [newField, ...model.fields];
    setExpandedFields(prev => [...prev, newField.id]);
    
    onUpdateModel({
      ...model,
      fields: updatedFields,
    });
  };

  const updateField = (index: number, updatedField: Field) => {
    const newFields = [...model.fields];
    newFields[index] = updatedField;
    onUpdateModel({
      ...model,
      fields: newFields,
    });
  };

  const removeField = (index: number) => {
    const newFields = [...model.fields];
    const removedField = newFields[index];
    newFields.splice(index, 1);
    
    // Remove from expanded fields
    if (removedField) {
      setExpandedFields(prev => prev.filter(id => id !== removedField.id));
    }
    
    onUpdateModel({
      ...model,
      fields: newFields,
    });
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === model.fields.length - 1)
    ) {
      return;
    }

    const newFields = [...model.fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    onUpdateModel({
      ...model,
      fields: newFields,
    });
  };

  const addModelAttribute = (attrType: string) => {
    // Check if this attribute type should only appear once 
    const isSingletonAttr = ["map", "ignore"].includes(attrType);
    
    // If it's a singleton attribute and already exists, don't add it again
    if (isSingletonAttr && model.attributes.some(attr => attr.type === attrType)) {
      return;
    }
    
    const newAttr: ModelAttribute = {
      type: attrType,
      arguments: [],
    };
    
    // Initialize with default arguments based on type
    if (attrType === "map") {
      newAttr.arguments = [{ name: "name", value: model.name.toLowerCase() }];
    } else if (attrType === "unique" || attrType === "index") {
      // For these attributes, we'll need to select fields
      newAttr.arguments = [{ name: "fields", value: "[]" }];
    } else if (attrType === "db") {
      newAttr.arguments = [{ 
        name: "value", 
        value: "",
        isExpression: true
      }];
    }
    
    onUpdateModel({
      ...model,
      attributes: [...model.attributes, newAttr],
    });
  };

  const updateAttributeArgument = (attr: ModelAttribute, argName: string, argValue: string, isExpression = false) => {
    const newAttr = { ...attr };
    const existingArg = newAttr.arguments.find(arg => arg.name === argName);
    
    if (existingArg) {
      existingArg.value = argValue;
      existingArg.isExpression = isExpression;
    } else {
      newAttr.arguments.push({ 
        name: argName, 
        value: argValue,
        isExpression 
      });
    }
    
    return newAttr;
  };

  const updateModelAttribute = (index: number, updatedAttr: ModelAttribute) => {
    const newAttributes = [...model.attributes];
    newAttributes[index] = updatedAttr;
    onUpdateModel({
      ...model,
      attributes: newAttributes,
    });
  };

  const removeModelAttribute = (index: number) => {
    const newAttributes = [...model.attributes];
    newAttributes.splice(index, 1);
    onUpdateModel({
      ...model,
      attributes: newAttributes,
    });
  };
  
  // Get the related model for relation fields
  const getRelatedModel = (fieldType: string) => {
    return allModels.find(m => m.name === fieldType);
  };
  
  // Get fields from a model
  const getModelFields = (modelName: string) => {
    const targetModel = allModels.find(m => m.name === modelName);
    return targetModel ? targetModel.fields : [];
  };
  
  // Handle field expansion
  const toggleFieldExpansion = (fieldId: string) => {
    setExpandedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId) 
        : [...prev, fieldId]
    );
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Label htmlFor="modelName" className="text-sm font-medium text-slate-700 mb-1 block">
          Model Name
        </Label>
        <Input
          id="modelName"
          value={model.name}
          onChange={(e) => updateModelName(e.target.value)}
          className="font-medium text-base"
        />
      </div>

      {/* Fields Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Fields</h3>
          <Button onClick={addField} className="flex items-center gap-1">
            <Plus size={14} />
            Add Field
          </Button>
        </div>

        {model.fields.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-300 rounded-md bg-slate-50">
            <p className="text-slate-500">No fields added yet. Click "Add Field" to create your first field.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {model.fields.map((field, index) => (
              <div key={field.id} className="border border-slate-200 rounded-md shadow-sm bg-white">
                <div 
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                  onClick={() => toggleFieldExpansion(field.id)}
                >
                  <div className="flex items-center text-left">
                    <span className="font-medium text-slate-800">{field.name}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      {field.type}
                      {field.isList && "[]"}
                      {!field.isRequired ? "?" : ""}
                    </span>
                  </div>
                  {expandedFields.includes(field.id) ? 
                    <ArrowUp size={16} className="text-slate-500" /> : 
                    <ArrowDown size={16} className="text-slate-500" />
                  }
                </div>
                
                {expandedFields.includes(field.id) && (
                  <div className="px-4 pb-4">
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`field-${index}-name`} className="text-sm mb-1 block">
                            Name
                          </Label>
                          <Input
                            id={`field-${index}-name`}
                            value={field.name}
                            onChange={(e) => {
                              updateField(index, { ...field, name: e.target.value });
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`field-${index}-type`} className="text-sm mb-1 block">
                            Type
                          </Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => {
                              updateField(index, { ...field, type: value });
                            }}
                          >
                            <SelectTrigger id={`field-${index}-type`}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PLACEHOLDER" disabled>
                                Scalar Types
                              </SelectItem>
                              {SCALAR_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                              {allEnums.length > 0 && (
                                <>
                                  <SelectItem value="ENUM_DIVIDER" disabled>
                                    Enums
                                  </SelectItem>
                                  {allEnums.map((enumItem) => (
                                    <SelectItem key={enumItem.id} value={enumItem.name}>
                                      {enumItem.name}
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                              {allModels.filter(m => m.id !== model.id).length > 0 && (
                                <>
                                  <SelectItem value="MODEL_DIVIDER" disabled>
                                    Models (Relations)
                                  </SelectItem>
                                  {allModels
                                    .filter(m => m.id !== model.id)
                                    .map((modelItem) => (
                                      <SelectItem key={modelItem.id} value={modelItem.name}>
                                        {modelItem.name}
                                      </SelectItem>
                                    ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-4 pt-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`field-${index}-required`}
                              checked={field.isRequired}
                              onCheckedChange={(checked) => {
                                updateField(index, { ...field, isRequired: !!checked });
                              }}
                            />
                            <Label htmlFor={`field-${index}-required`} className="text-sm">
                              Required
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`field-${index}-list`}
                              checked={field.isList}
                              onCheckedChange={(checked) => {
                                updateField(index, { ...field, isList: !!checked });
                              }}
                            />
                            <Label htmlFor={`field-${index}-list`} className="text-sm">
                              List
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Field Attributes */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm font-medium">Attributes</Label>
                          <div className="flex space-x-2">
                            <Select
                              onValueChange={(value) => {
                                // Don't add duplicate attributes
                                if (field.attributes.some(attr => attr.name === value)) {
                                  return;
                                }
                                
                                const newAttr: Attribute = { name: value, arguments: [] };
                                
                                // Initialize some attributes with default arguments
                                if (value === "default") {
                                  // For enum types, we'll handle this differently with a dropdown
                                  const isEnumType = allEnums.some(e => e.name === field.type);
                                  
                                  if (isEnumType) {
                                    const enumValues = allEnums.find(e => e.name === field.type)?.values || [];
                                    const defaultValue = enumValues.length > 0 ? enumValues[0] : "";
                                    
                                    newAttr.arguments = [{ 
                                      name: "value", 
                                      value: `${field.type}.${defaultValue}`,
                                      isExpression: true
                                    }];
                                  } else if (field.type === "String") {
                                    newAttr.arguments = [{ 
                                      name: "value", 
                                      value: '""',
                                      isExpression: false
                                    }];
                                  } else if (field.type === "Boolean") {
                                    newAttr.arguments = [{ 
                                      name: "value", 
                                      value: "false",
                                      isExpression: true
                                    }];
                                  } else if (field.type === "Int" || field.type === "Float") {
                                    newAttr.arguments = [{ 
                                      name: "value", 
                                      value: "0",
                                      isExpression: true
                                    }];
                                  } else if (field.type === "DateTime") {
                                    newAttr.arguments = [{ 
                                      name: "value", 
                                      value: "now()",
                                      isExpression: true
                                    }];
                                  }
                                } else if (value === "map") {
                                  newAttr.arguments = [{ 
                                    name: "name", 
                                    value: `"${field.name}"`,
                                    isExpression: false
                                  }];
                                } else if (value === "relation") {
                                  const relatedModel = allModels.find(m => m.name === field.type);
                                  if (relatedModel) {
                                    newAttr.arguments = [
                                      { name: "name", value: `"${field.name}"`, isExpression: false },
                                      { name: "fields", value: "[]", isExpression: true },
                                      { name: "references", value: "[]", isExpression: true }
                                    ];
                                  }
                                } else if (value === "db") {
                                  newAttr.arguments = [{ 
                                    name: "value", 
                                    value: "",
                                    isExpression: true
                                  }];
                                }
                                
                                updateField(index, {
                                  ...field,
                                  attributes: [...field.attributes, newAttr]
                                });
                              }}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Add attribute" />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_ATTRIBUTES.map((attr) => (
                                  <SelectItem 
                                    key={attr.value} 
                                    value={attr.value}
                                    disabled={field.attributes.some(a => a.name === attr.value)}
                                  >
                                    {attr.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {field.attributes.length > 0 ? (
                          <div className="space-y-3 mt-3">
                            {field.attributes.map((attr, attrIndex) => (
                              <div 
                                key={`${field.id}-attr-${attrIndex}`} 
                                className="p-3 border border-slate-200 rounded-md bg-slate-50"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-sm">@{attr.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-slate-500 hover:text-red-500"
                                    onClick={() => {
                                      const newAttributes = [...field.attributes];
                                      newAttributes.splice(attrIndex, 1);
                                      updateField(index, {
                                        ...field,
                                        attributes: newAttributes
                                      });
                                    }}
                                  >
                                    <Trash size={14} />
                                  </Button>
                                </div>
                                
                                {/* Attribute arguments */}
                                {attr.name === "default" && (
                                  <div className="mt-2">
                                    <Label className="text-xs text-slate-500 mb-1 block">Value</Label>
                                    
                                    {/* Check if it's an enum type and render a dropdown */}
                                    {allEnums.some(e => e.name === field.type) ? (
                                      <Select
                                        value={attr.arguments.find(arg => arg.name === "value")?.value?.replace(`${field.type}.`, "") || ""}
                                        onValueChange={(value) => {
                                          const newAttributes = [...field.attributes];
                                          const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "value");
                                          const enumValue = `${field.type}.${value}`;
                                          
                                          if (argIndex >= 0) {
                                            newAttributes[attrIndex].arguments[argIndex].value = enumValue;
                                            newAttributes[attrIndex].arguments[argIndex].isExpression = true;
                                          } else {
                                            newAttributes[attrIndex].arguments.push({ 
                                              name: "value", 
                                              value: enumValue, 
                                              isExpression: true 
                                            });
                                          }
                                          
                                          updateField(index, {
                                            ...field,
                                            attributes: newAttributes
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select enum value" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {allEnums.find(e => e.name === field.type)?.values.map(value => (
                                            <SelectItem key={value} value={value}>
                                              {value}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : field.type === "Boolean" ? (
                                      <Select
                                        value={attr.arguments.find(arg => arg.name === "value")?.value || "false"}
                                        onValueChange={(value) => {
                                          const newAttributes = [...field.attributes];
                                          const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "value");
                                          if (argIndex >= 0) {
                                            newAttributes[attrIndex].arguments[argIndex].value = value;
                                          } else {
                                            newAttributes[attrIndex].arguments.push({ name: "value", value, isExpression: true });
                                          }
                                          updateField(index, {
                                            ...field,
                                            attributes: newAttributes
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="true">true</SelectItem>
                                          <SelectItem value="false">false</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : field.type === "DateTime" ? (
                                      <Select
                                        value={attr.arguments.find(arg => arg.name === "value")?.value || "now()"}
                                        onValueChange={(value) => {
                                          const newAttributes = [...field.attributes];
                                          const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "value");
                                          if (argIndex >= 0) {
                                            newAttributes[attrIndex].arguments[argIndex].value = value;
                                            newAttributes[attrIndex].arguments[argIndex].isExpression = true;
                                          } else {
                                            newAttributes[attrIndex].arguments.push({ 
                                              name: "value", 
                                              value, 
                                              isExpression: true 
                                            });
                                          }
                                          updateField(index, {
                                            ...field,
                                            attributes: newAttributes
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="now()">now()</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : field.type === "String" && attr.name === "default" ? (
                                      <Select
                                        value={attr.arguments.find(arg => arg.name === "value")?.value || '""'}
                                        onValueChange={(value) => {
                                          const newAttributes = [...field.attributes];
                                          const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "value");
                                          const isBuiltInFunc = DEFAULT_PROVIDERS.some(p => p.value === value);
                                          
                                          if (argIndex >= 0) {
                                            newAttributes[attrIndex].arguments[argIndex].value = value;
                                            newAttributes[attrIndex].arguments[argIndex].isExpression = isBuiltInFunc;
                                          } else {
                                            newAttributes[attrIndex].arguments.push({ 
                                              name: "value", 
                                              value, 
                                              isExpression: isBuiltInFunc 
                                            });
                                          }
                                          updateField(index, {
                                            ...field,
                                            attributes: newAttributes
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value='""'>Empty string</SelectItem>
                                          {DEFAULT_PROVIDERS.map(provider => (
                                            <SelectItem key={provider.value} value={provider.value}>
                                              {provider.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Input
                                        value={attr.arguments.find(arg => arg.name === "value")?.value || ""}
                                        onChange={(e) => {
                                          const newAttributes = [...field.attributes];
                                          const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "value");
                                          if (argIndex >= 0) {
                                            newAttributes[attrIndex].arguments[argIndex].value = e.target.value;
                                          } else {
                                            newAttributes[attrIndex].arguments.push({ 
                                              name: "value", 
                                              value: e.target.value, 
                                              isExpression: false 
                                            });
                                          }
                                          updateField(index, {
                                            ...field,
                                            attributes: newAttributes
                                          });
                                        }}
                                        placeholder="Value"
                                      />
                                    )}
                                  </div>
                                )}
                                
                                {attr.name === "map" && (
                                  <div className="mt-2">
                                    <Label className="text-xs text-slate-500 mb-1 block">Database Column Name</Label>
                                    <Input
                                      value={attr.arguments.find(arg => arg.name === "name")?.value.replace(/"/g, "") || ""}
                                      onChange={(e) => {
                                        const newAttributes = [...field.attributes];
                                        const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "name");
                                        if (argIndex >= 0) {
                                          newAttributes[argIndex].arguments[argIndex].value = `"${e.target.value}"`;
                                        } else {
                                          newAttributes[attrIndex].arguments.push({ 
                                            name: "name", 
                                            value: `"${e.target.value}"`, 
                                            isExpression: false 
                                          });
                                        }
                                        updateField(index, {
                                          ...field,
                                          attributes: newAttributes
                                        });
                                      }}
                                      placeholder="Column name"
                                    />
                                  </div>
                                )}
                                
                                {attr.name === "db" && (
                                  <div className="mt-2">
                                    <Label className="text-xs text-slate-500 mb-1 block">Database Type</Label>
                                    <Input
                                      value={attr.arguments.find(arg => arg.name === "value")?.value || "Text"}
                                      onChange={(e) => {
                                        const newAttributes = [...field.attributes];
                                        const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "value");
                                        if (argIndex >= 0) {
                                          newAttributes[argIndex].arguments[argIndex].value = e.target.value;
                                        } else {
                                          newAttributes[attrIndex].arguments.push({ 
                                            name: "value", 
                                            value: e.target.value,
                                            isExpression: true
                                          });
                                        }
                                        updateField(index, {
                                          ...field,
                                          attributes: newAttributes
                                        });
                                      }}
                                      placeholder="Text"
                                    />
                                  </div>
                                )}
                                
                                {attr.name === "relation" && (
                                  <div className="space-y-3 mt-2">
                                    <div>
                                      <Label className="text-xs text-slate-500 mb-1 block">Relation Name</Label>
                                      <Input
                                        value={attr.arguments.find(arg => arg.name === "name")?.value.replace(/"/g, "") || ""}
                                        onChange={(e) => {
                                          const newAttributes = [...field.attributes];
                                          const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "name");
                                          if (argIndex >= 0) {
                                            newAttributes[argIndex].arguments[argIndex].value = `"${e.target.value}"`;
                                          } else {
                                            newAttributes[attrIndex].arguments.push({ 
                                              name: "name", 
                                              value: `"${e.target.value}"`, 
                                              isExpression: false 
                                            });
                                          }
                                          updateField(index, {
                                            ...field,
                                            attributes: newAttributes
                                          });
                                        }}
                                        placeholder="Relation name"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs text-slate-500 mb-1 block">On Delete</Label>
                                      <Select
                                        value={attr.arguments.find(arg => arg.name === "onDelete")?.value || ""}
                                        onValueChange={(value) => {
                                          const newAttributes = [...field.attributes];
                                          const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "onDelete");
                                          if (argIndex >= 0) {
                                            newAttributes[argIndex].arguments[argIndex].value = value;
                                          } else {
                                            newAttributes[attrIndex].arguments.push({ 
                                              name: "onDelete", 
                                              value, 
                                              isExpression: true 
                                            });
                                          }
                                          updateField(index, {
                                            ...field,
                                            attributes: newAttributes
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {ON_DELETE_ACTIONS.map(action => (
                                            <SelectItem key={action} value={action}>
                                              {action}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs text-slate-500 mb-1 block">Fields</Label>
                                      <Select
                                        value={""}
                                        onValueChange={(fieldName) => {
                                          const newAttributes = [...field.attributes];
                                          const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "fields");
                                          
                                          // Parse existing fields array
                                          let fields: string[] = [];
                                          const existingValue = newAttributes[attrIndex].arguments[argIndex]?.value || "[]";
                                          try {
                                            // Remove brackets and split by commas
                                            const fieldsStr = existingValue.replace(/^\[|\]$/g, "").trim();
                                            fields = fieldsStr ? fieldsStr.split(",").map(f => f.trim()) : [];
                                          } catch (e) {
                                            fields = [];
                                          }
                                          
                                          // Add new field if not already there
                                          if (!fields.includes(fieldName)) {
                                            fields.push(fieldName);
                                          }
                                          
                                          // Update the attribute
                                          const newValue = fields.length > 0 ? `[${fields.join(", ")}]` : "[]";
                                          if (argIndex >= 0) {
                                            newAttributes[attrIndex].arguments[argIndex].value = newValue;
                                          } else {
                                            newAttributes[attrIndex].arguments.push({ 
                                              name: "fields", 
                                              value: newValue, 
                                              isExpression: true 
                                            });
                                          }
                                          
                                          updateField(index, {
                                            ...field,
                                            attributes: newAttributes
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select fields" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {model.fields.filter(f => f.id !== field.id).map(f => (
                                            <SelectItem key={f.id} value={f.name}>
                                              {f.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {attr.arguments.find(arg => arg.name === "fields")?.value
                                          .replace(/^\[|\]$/g, "")
                                          .split(",")
                                          .map(f => f.trim())
                                          .filter(Boolean)
                                          .map((fieldName, i) => (
                                            <div 
                                              key={i} 
                                              className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-md flex items-center"
                                            >
                                              <span>{fieldName}</span>
                                              <button
                                                type="button"
                                                className="ml-1 text-slate-500 hover:text-slate-800"
                                                onClick={() => {
                                                  const newAttributes = [...field.attributes];
                                                  const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "fields");
                                                  
                                                  // Get all fields and remove this one
                                                  let fields: string[] = [];
                                                  const existingValue = newAttributes[attrIndex].arguments[argIndex]?.value || "[]";
                                                  try {
                                                    const fieldsStr = existingValue.replace(/^\[|\]$/g, "").trim();
                                                    fields = fieldsStr ? fieldsStr.split(",").map(f => f.trim()) : [];
                                                  } catch (e) {
                                                    fields = [];
                                                  }
                                                  
                                                  // Remove the field
                                                  fields = fields.filter(f => f !== fieldName);
                                                  
                                                  // Update the attribute
                                                  const newValue = fields.length > 0 ? `[${fields.join(", ")}]` : "[]";
                                                  
                                                  if (argIndex >= 0) {
                                                    newAttributes[attrIndex].arguments[argIndex].value = newValue;
                                                  }
                                                  
                                                  updateField(index, {
                                                    ...field,
                                                    attributes: newAttributes
                                                  });
                                                }}
                                              >
                                                ×
                                              </button>
                                            </div>
                                          ))
                                        }
                                        {!attr.arguments.find(arg => arg.name === "fields")?.value
                                          .replace(/^\[|\]$/g, "")
                                          .split(",")
                                          .map(f => f.trim())
                                          .filter(Boolean)
                                          .length && (
                                          <div className="text-xs text-slate-500">No fields selected</div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs text-slate-500 mb-1 block">References</Label>
                                      <Select
                                        value={""}
                                        onValueChange={(fieldName) => {
                                          const newAttributes = [...field.attributes];
                                          const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "references");
                                          
                                          // Parse existing references array
                                          let references: string[] = [];
                                          const existingValue = newAttributes[attrIndex].arguments[argIndex]?.value || "[]";
                                          try {
                                            // Remove brackets and split by commas
                                            const refsStr = existingValue.replace(/^\[|\]$/g, "").trim();
                                            references = refsStr ? refsStr.split(",").map(f => f.trim()) : [];
                                          } catch (e) {
                                            references = [];
                                          }
                                          
                                          // Add new reference if not already there
                                          if (!references.includes(fieldName)) {
                                            references.push(fieldName);
                                          }
                                          
                                          // Update the attribute
                                          const newValue = references.length > 0 ? `[${references.join(", ")}]` : "[]";
                                          if (argIndex >= 0) {
                                            newAttributes[attrIndex].arguments[argIndex].value = newValue;
                                          } else {
                                            newAttributes[attrIndex].arguments.push({ 
                                              name: "references", 
                                              value: newValue, 
                                              isExpression: true 
                                            });
                                          }
                                          
                                          updateField(index, {
                                            ...field,
                                            attributes: newAttributes
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select references" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getRelatedModel(field.type)?.fields.map(f => (
                                            <SelectItem key={f.id} value={f.name}>
                                              {f.name}
                                            </SelectItem>
                                          )) || (
                                            <SelectItem value="id" disabled>
                                              No fields available
                                            </SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {attr.arguments.find(arg => arg.name === "references")?.value
                                          .replace(/^\[|\]$/g, "")
                                          .split(",")
                                          .map(f => f.trim())
                                          .filter(Boolean)
                                          .map((refName, i) => (
                                            <div 
                                              key={i} 
                                              className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-md flex items-center"
                                            >
                                              <span>{refName}</span>
                                              <button
                                                type="button"
                                                className="ml-1 text-slate-500 hover:text-slate-800"
                                                onClick={() => {
                                                  const newAttributes = [...field.attributes];
                                                  const argIndex = newAttributes[attrIndex].arguments.findIndex(arg => arg.name === "references");
                                                  
                                                  // Get all references and remove this one
                                                  let references: string[] = [];
                                                  const existingValue = newAttributes[attrIndex].arguments[argIndex]?.value || "[]";
                                                  try {
                                                    const refsStr = existingValue.replace(/^\[|\]$/g, "").trim();
                                                    references = refsStr ? refsStr.split(",").map(f => f.trim()) : [];
                                                  } catch (e) {
                                                    references = [];
                                                  }
                                                  
                                                  // Remove the reference
                                                  references = references.filter(f => f !== refName);
                                                  
                                                  // Update the attribute
                                                  const newValue = references.length > 0 ? `[${references.join(", ")}]` : "[]";
                                                  
                                                  if (argIndex >= 0) {
                                                    newAttributes[attrIndex].arguments[argIndex].value = newValue;
                                                  }
                                                  
                                                  updateField(index, {
                                                    ...field,
                                                    attributes: newAttributes
                                                  });
                                                }}
                                              >
                                                ×
                                              </button>
                                            </div>
                                          ))
                                        }
                                        {!attr.arguments.find(arg => arg.name === "references")?.value
                                          .replace(/^\[|\]$/g, "")
                                          .split(",")
                                          .map(f => f.trim())
                                          .filter(Boolean)
                                          .length && (
                                          <div className="text-xs text-slate-500">No references selected</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3 border border-dashed border-slate-200 rounded-md bg-slate-50">
                            <p className="text-sm text-slate-500">No attributes added</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-4 pt-3 border-t border-slate-200">
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => moveField(index, "up")}
                          disabled={index === 0}
                          className={cn(
                            "h-8 w-8",
                            index === 0 ? "opacity-50 cursor-not-allowed" : ""
                          )}
                        >
                          <ArrowUp size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => moveField(index, "down")}
                          disabled={index === model.fields.length - 1}
                          className={cn(
                            "h-8 w-8",
                            index === model.fields.length - 1 ? "opacity-50 cursor-not-allowed" : ""
                          )}
                        >
                          <ArrowDown size={14} />
                        </Button>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeField(index)}
                        className="flex items-center gap-1"
                      >
                        <Trash size={14} />
                        Remove Field
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Attributes Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Model Attributes</h3>
          <Select
            onValueChange={addModelAttribute}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Add Model Attribute" />
            </SelectTrigger>
            <SelectContent>
              {MODEL_ATTRIBUTES.map((attr) => {
                // For singleton attributes, disable if they already exist
                const isSingleton = ["map", "ignore"].includes(attr.value);
                const isDisabled = isSingleton && model.attributes.some(a => a.type === attr.value);
                
                return (
                  <SelectItem 
                    key={attr.value} 
                    value={attr.value}
                    disabled={isDisabled}
                  >
                    {attr.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {model.attributes.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-300 rounded-md bg-slate-50">
            <p className="text-slate-500">No model attributes added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {model.attributes.map((attr, attrIndex) => (
              <div
                key={`model-attr-${attrIndex}`}
                className="p-4 border border-slate-200 rounded-md shadow-sm bg-white"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <span className="font-medium text-slate-800">@@{attr.type}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-500 hover:text-red-500"
                    onClick={() => removeModelAttribute(attrIndex)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>

                <div className="space-y-3">
                  {attr.type === "map" && (
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Database Table Name</Label>
                      <Input
                        value={attr.arguments[0]?.value || ""}
                        onChange={(e) => {
                          const updatedAttr = updateAttributeArgument(attr, "name", e.target.value);
                          updateModelAttribute(attrIndex, updatedAttr);
                        }}
                        placeholder="Table name"
                      />
                    </div>
                  )}
                  
                  {/* Other model attribute types can be added here */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Snippet Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-800">Model Preview</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setModelCodeView(!modelCodeView)}
          >
            <Code size={14} />
            {modelCodeView ? "Hide Code" : "Show Code"}
          </Button>
        </div>
        
        {modelCodeView && (
          <div className="relative rounded-md border border-slate-200 bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-700">
              <h3 className="text-sm font-medium text-slate-200">{model.name}.prisma</h3>
            </div>
            <pre className="p-4 text-sm text-slate-200 overflow-auto max-h-[300px] whitespace-pre-wrap">
              <code>{modelCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelEditor;
