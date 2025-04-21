import { Schema, Model, Enum, Field, Attribute, ModelAttribute } from "@/types/schema";

// Utility function to indent code blocks
const indent = (text: string, spaces: number = 2): string => {
  const padding = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.trim() ? padding + line : line))
    .join("\n");
};

// Generate code for a specific model
export const generateModelCode = (model: Model): string => {
  const fieldLines = model.fields.map((field) => {
    const type = field.type + (field.isList ? "[]" : "") + (!field.isRequired ? "?" : "");
    const attributes = field.attributes
      .map((attr) => {
        const args = attr.arguments
          .map((arg) => {
            // Format the argument based on whether it's an expression or not
            const formattedValue = arg.isExpression 
              ? arg.value 
              : arg.value.startsWith('"') || arg.value.startsWith("'") 
                ? arg.value 
                : `"${arg.value}"`;
            
            return formattedValue;
          })
          .join(", ");
        
        // Ensure that any function-like value that doesn't end with a closing parenthesis gets one added
        if (attr.name === "default" && args.includes("(") && !args.endsWith(")")) {
          return `@${attr.name}(${args}))`;
        }

        if (attr.name === "db") {
          return args ? `@${attr.name}.${args}` : ``;
        }

        if (attr.name === "relation") {
          return `@${attr.name}(${attr.arguments.map(arg => `${arg.name}: ${arg.value}`).join(", ")})`;
        }
        
        return `@${attr.name}${args ? `(${args})` : ""}`;
      })
      .join(" ");

    return `  ${field.name} ${type}${attributes ? " " + attributes : ""}`;
  });

  const modelAttributes = model.attributes
    .map((attr) => {
      const args = attr.arguments
        .map((arg) => arg.value)
        .join(", ");
      
      return `\n  @@${attr.type}${args ? `(${args})` : ""}`;
    })
    .join("\n");

  const modelBody = [...fieldLines, ...(modelAttributes ? [modelAttributes] : [])].join("\n");

  return `model ${model.name} {
${modelBody}
}`;
};

// Generate code for a specific enum
export const generateEnumCode = (enumData: Enum): string => {
  const valuesCode = enumData.values.map((value) => `  ${value}`).join("\n");
  
  return `enum ${enumData.name} {
${valuesCode}
}`;
};

// Generate code for the configuration blocks
export const generateConfigCode = (datasource: any, generator: any): string => {
  const datasourceCode = `datasource db {
  provider = "${datasource.provider}"
  url      = ${datasource.url}
}`;

  const previewFeatures = generator.previewFeatures && generator.previewFeatures.length > 0
    ? `\n  previewFeatures = [${generator.previewFeatures.map(f => `"${f}"`).join(", ")}]`
    : "";
  
  const binaryTargets = generator.binaryTargets && generator.binaryTargets.length > 0
    ? `\n  binaryTargets = [${generator.binaryTargets.map(t => `"${t}"`).join(", ")}]`
    : "";
  
  const output = generator.output
    ? `\n  output = "${generator.output}"`
    : "";

  const generatorCode = `generator client {
  provider = "${generator.provider}"${output}${previewFeatures}${binaryTargets}
}`;

  return `${datasourceCode}\n\n${generatorCode}`;
};

// Generate the full Prisma schema code
export const generateSchemaCode = (schema: Schema): string => {
  // Remove internal IDs when outputting the schema
  const sanitizedSchema = {
    ...schema,
    models: schema.models.map(model => ({
      ...model,
      id: undefined, // Remove the ID
      fields: model.fields.map(field => ({
        ...field,
        id: undefined // Remove field IDs too
      }))
    })),
    enums: schema.enums.map(enumItem => ({
      ...enumItem,
      id: undefined // Remove enum IDs
    }))
  };

  const { datasource, generator, models, enums } = sanitizedSchema;

  const datasourceCode = `datasource db {
  provider = "${datasource.provider}"
  url      = ${datasource.url}
}`;

  const previewFeatures = generator.previewFeatures && generator.previewFeatures.length > 0
    ? `\n  previewFeatures = [${generator.previewFeatures.map(f => `"${f}"`).join(", ")}]`
    : "";
  
  const binaryTargets = generator.binaryTargets && generator.binaryTargets.length > 0
    ? `\n  binaryTargets = [${generator.binaryTargets.map(t => `"${t}"`).join(", ")}]`
    : "";
  
  const output = generator.output
    ? `\n  output = "${generator.output}"`
    : "";

  const generatorCode = `generator client {
  provider = "${generator.provider}"${output}${previewFeatures}${binaryTargets}
}`;

  const modelsCode = models
    .map((model) => generateModelCode(model))
    .join("\n\n");

  const enumsCode = enums
    .map((enumData) => generateEnumCode(enumData))
    .join("\n\n");

  const sections = [
    datasourceCode,
    generatorCode,
    modelsCode,
    enumsCode,
  ].filter(Boolean);

  return sections.join("\n\n");
};

// Parse a Prisma schema string
export const parseSchema = (schemaContent: string): Schema | null => {
  try {
    // Strip comments
    const contentWithoutComments = schemaContent.replace(/\/\/.*$/gm, '');
    
    // Initialize schema structure
    const schema: Schema = {
      models: [],
      enums: [],
      datasource: {
        provider: "postgresql",
        url: 'env("DATABASE_URL")'
      },
      generator: {
        provider: "prisma-client-js",
        previewFeatures: [],
        binaryTargets: ["native"]
      }
    };
    
    // Regular expressions for matching
    const modelRegex = /model\s+(\w+)\s*{([^}]*)}/gms;
    const enumRegex = /enum\s+(\w+)\s*{([^}]*)}/gms;
    const datasourceRegex = /datasource\s+\w+\s*{([^}]*)}/gms;
    const generatorRegex = /generator\s+\w+\s*{([^}]*)}/gms;
    
    // Parse datasource
    let datasourceMatch;
    while ((datasourceMatch = datasourceRegex.exec(contentWithoutComments)) !== null) {
      const datasourceBody = datasourceMatch[1];
      
      const providerMatch = /provider\s*=\s*["']([^"']+)["']/m.exec(datasourceBody);
      const urlMatch = /url\s*=\s*(.*)/m.exec(datasourceBody);
      
      if (providerMatch && urlMatch) {
        schema.datasource = {
          provider: providerMatch[1],
          url: urlMatch[1].trim()
        };
      }
    }
    
    // Parse generator
    let generatorMatch;
    while ((generatorMatch = generatorRegex.exec(contentWithoutComments)) !== null) {
      const generatorBody = generatorMatch[1];
      
      const providerMatch = /provider\s*=\s*["']([^"']+)["']/m.exec(generatorBody);
      const outputMatch = /output\s*=\s*["']([^"']+)["']/m.exec(generatorBody);
      
      const previewFeaturesMatch = /previewFeatures\s*=\s*\[(.*)\]/m.exec(generatorBody);
      const binaryTargetsMatch = /binaryTargets\s*=\s*\[(.*)\]/m.exec(generatorBody);
      
      if (providerMatch) {
        schema.generator = {
          provider: providerMatch[1],
          output: outputMatch ? outputMatch[1] : undefined,
          previewFeatures: previewFeaturesMatch 
            ? previewFeaturesMatch[1].split(',').map(f => f.trim().replace(/["']/g, ''))
            : [],
          binaryTargets: binaryTargetsMatch 
            ? binaryTargetsMatch[1].split(',').map(t => t.trim().replace(/["']/g, ''))
            : ["native"]
        };
      }
    }
    
    // Parse models
    let modelMatch;
    while ((modelMatch = modelRegex.exec(contentWithoutComments)) !== null) {
      const modelName = modelMatch[1];
      const modelBody = modelMatch[2];
      
      const model: Model = {
        id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: modelName,
        fields: [],
        attributes: []
      };
      
      // Parse model body line by line
      const lines = modelBody.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Parse model attributes (@@)
        if (trimmedLine.startsWith('@@')) {
          const attrMatch = /@@(\w+)(?:\((.*)\))?/.exec(trimmedLine);
          if (attrMatch) {
            const type = attrMatch[1];
            const argsStr = attrMatch[2] || '';
            
            const args = parseAttributeArguments(argsStr);
            
            model.attributes.push({
              type,
              arguments: args.map(arg => ({
                name: arg.name,
                value: arg.value
              }))
            });
          }
        } 
        // Parse fields
        else if (!trimmedLine.startsWith('//')) {
          const fieldMatch = /(\w+)\s+(\w+)(\[\])?(\?)?(?:\s+(.*))?/.exec(trimmedLine);
          if (fieldMatch) {
            const name = fieldMatch[1];
            const type = fieldMatch[2];
            const isList = Boolean(fieldMatch[3]);
            const isRequired = !fieldMatch[4];
            const fieldAttrs = fieldMatch[5] || '';
            
            const field: Field = {
              id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              type,
              isList,
              isRequired,
              attributes: []
            };
            
            // Parse field attributes
            if (fieldAttrs) {
              const attrRegex = /@(\w+)(?:\((.*?)\))?/g;
              let attrMatch;
              
              while ((attrMatch = attrRegex.exec(fieldAttrs)) !== null) {
                const attrName = attrMatch[1];
                const argsStr = attrMatch[2] || '';
                
                const args = parseAttributeArguments(argsStr);
                
                field.attributes.push({
                  name: attrName,
                  arguments: args
                });
              }
            }
            
            model.fields.push(field);
          }
        }
      }
      
      schema.models.push(model);
    }
    
    // Parse enums
    let enumMatch;
    while ((enumMatch = enumRegex.exec(contentWithoutComments)) !== null) {
      const enumName = enumMatch[1];
      const enumBody = enumMatch[2];
      
      const values = enumBody
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'));
      
      schema.enums.push({
        id: `enum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: enumName,
        values
      });
    }
    
    return schema;
  } catch (error) {
    console.error("Error parsing schema:", error);
    return null;
  }
};

// Helper function to parse attribute arguments
const parseAttributeArguments = (argsStr: string) => {
  const args: { name: string; value: string; isExpression?: boolean }[] = [];
  
  if (!argsStr.trim()) return args;
  
  // Handle complex nested structures like arrays or nested objects
  let buffer = '';
  let depth = 0;
  let isInString = false;
  let currentQuote = '';
  let currentArgName = '';
  
  const processArg = (arg: string) => {
    const colonIndex = arg.indexOf(':');
    
    if (colonIndex !== -1) {
      const name = arg.substring(0, colonIndex).trim();
      const value = arg.substring(colonIndex + 1).trim();
      
      // Determine if the value is an expression or string literal
      const isExpression = !(
        (value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))
      );
      
      args.push({ name, value, isExpression });
    } else {
      // For args without a name (like in default(cuid()))
      args.push({ 
        name: "value", 
        value: arg.trim(),
        isExpression: !(
          (arg.startsWith('"') && arg.endsWith('"')) || 
          (arg.startsWith("'") && arg.endsWith("'"))
        )
      });
    }
  };
  
  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    
    if (isInString) {
      buffer += char;
      if (char === currentQuote && argsStr[i - 1] !== '\\') {
        isInString = false;
      }
    } else {
      if (char === '"' || char === "'") {
        isInString = true;
        currentQuote = char;
        buffer += char;
      } else if (char === '[' || char === '{' || char === '(') {
        depth++;
        buffer += char;
      } else if (char === ']' || char === '}' || char === ')') {
        depth--;
        buffer += char;
      } else if (char === ',' && depth === 0) {
        processArg(buffer);
        buffer = '';
      } else if (char === ':' && currentArgName === '') {
        currentArgName = buffer.trim();
        buffer += char;
      } else {
        buffer += char;
      }
    }
  }
  
  if (buffer.trim()) {
    processArg(buffer);
  }
  
  return args;
};
