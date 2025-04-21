import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import ModelEditor from "@/components/ModelEditor";
import EnumEditor from "@/components/EnumEditor";
import ConfigEditor from "@/components/ConfigEditor";
import ConfigPreview from "@/components/ConfigPreview";
import SchemaPreview from "@/components/SchemaPreview";
import ERDDiagram from "@/components/ERDDiagram";
import { Schema, Model, Enum, Datasource, Generator } from "@/types/schema";
import { generateSchemaCode, parseSchema } from "@/utils/schemaGenerator";
import { Button } from "@/components/ui/button";

const initialSchema: Schema = {
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

const Index = () => {
  const { toast } = useToast();
  const [schema, setSchema] = useState<Schema>(initialSchema);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showERD, setShowERD] = useState(false);

  const handleSelectItem = (itemType: "model" | "enum" | "datasource" | "generator", itemId: string) => {
    const newActiveItem = `${itemType}-${itemId}`;
    setActiveItem(newActiveItem);
    setShowPreview(false);
    setShowERD(false);
  };

  const handleNewModel = () => {
    const newModel: Model = {
      id: `model_${Date.now()}`,
      name: `Model${schema.models.length + 1}`,
      fields: [],
      attributes: []
    };
    
    setSchema({
      ...schema,
      models: [...schema.models, newModel]
    });
    
    setActiveItem(`model-${newModel.id}`);
    setShowPreview(false);
    
    toast({
      title: "Model created",
      description: `New model "${newModel.name}" has been created`,
    });
  };

  const handleNewEnum = () => {
    const newEnum: Enum = {
      id: `enum_${Date.now()}`,
      name: `Enum${schema.enums.length + 1}`,
      values: []
    };
    
    setSchema({
      ...schema,
      enums: [...schema.enums, newEnum]
    });
    
    setActiveItem(`enum_${newEnum.id}`);
    setShowPreview(false);
    
    toast({
      title: "Enum created",
      description: `New enum "${newEnum.name}" has been created`,
    });
  };

  const handleDeleteModel = (modelId: string) => {
    setSchema({
      ...schema,
      models: schema.models.filter(model => model.id !== modelId)
    });
    
    if (activeItem === `model_${modelId}`) {
      setActiveItem(null);
    }
    
    toast({
      title: "Model deleted",
      description: "The model has been deleted",
    });
  };

  const handleDeleteEnum = (enumId: string) => {
    setSchema({
      ...schema,
      enums: schema.enums.filter(enumItem => enumItem.id !== enumId)
    });
    
    if (activeItem === `enum_${enumId}`) {
      setActiveItem(null);
    }
    
    toast({
      title: "Enum deleted",
      description: "The enum has been deleted",
    });
  };

  const handleUpdateModel = (updatedModel: Model) => {
    setSchema({
      ...schema,
      models: schema.models.map(model => 
        model.id === updatedModel.id ? updatedModel : model
      )
    });
  };

  const handleUpdateEnum = (updatedEnum: Enum) => {
    setSchema({
      ...schema,
      enums: schema.enums.map(enumItem => 
        enumItem.id === updatedEnum.id ? updatedEnum : enumItem
      )
    });
  };

  const handleUpdateDatasource = (updatedDatasource: Datasource) => {
    setSchema({
      ...schema,
      datasource: updatedDatasource
    });
  };

  const handleUpdateGenerator = (updatedGenerator: Generator) => {
    setSchema({
      ...schema,
      generator: updatedGenerator
    });
  };

  const handleImportSchema = (schemaContent: string) => {
    try {
      const parsedSchema = parseSchema(schemaContent);
      if (parsedSchema) {
        // Generate IDs for models and enums if they don't have them
        const modelsWithIds = parsedSchema.models.map(model => {
          if (!model.id) {
            return {
              ...model, 
              id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
          }
          return model;
        });
        
        const enumsWithIds = parsedSchema.enums.map(enumItem => {
          if (!enumItem.id) {
            return {
              ...enumItem, 
              id: `enum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
          }
          return enumItem;
        });
        
        setSchema({
          ...parsedSchema,
          models: modelsWithIds,
          enums: enumsWithIds
        });
        
        setActiveItem(null);
        
        toast({
          title: "Schema imported",
          description: "Your schema has been imported successfully",
        });
      } else {
        toast({
          title: "Import failed",
          description: "Could not parse the schema file",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      console.error("Error importing schema:", error);
      toast({
        title: "Import failed",
        description: "An error occurred while importing the schema",
        variant: "destructive"
      });
    }
  };

  const handleExportSchema = () => {
    try {
      const schemaCode = generateSchemaCode(schema);
      const blob = new Blob([schemaCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = "schema.prisma";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Schema exported",
        description: "Your schema has been exported as schema.prisma",
      });
      
      // Return the schema code for use in the Save functionality
      return schemaCode;
    } catch (error: unknown) {
      console.error("Error exporting schema:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the schema",
        variant: "destructive"
      });
      return null;
    }
  };

  const getSchemaCode = () => {
    try {
      return generateSchemaCode(schema);
    } catch (error: unknown) {
      console.error("Error generating schema code:", error);
      toast({
        title: "Schema generation failed",
        description: "An error occurred while generating the schema code",
        variant: "destructive"
      });
      return "";
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      setActiveItem(null);
      setShowERD(false);
    }
  };

  const toggleERD = () => {
    setShowERD(!showERD);
    if (!showERD) {
      setActiveItem(null);
      setShowPreview(false);
    }
  };

  // Get active content based on the selected item
  const getActiveContent = () => {
    if (showERD) {
      return <ERDDiagram schema={schema} />;
    }
    
    if (showPreview) {
      return <SchemaPreview schema={schema} />;
    }
    
    if (!activeItem) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-slate-700 mb-2">Welcome to Prisma Schema Editor</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            Select an item from the sidebar to start editing, or create a new model or enum.
          </p>
          <div className="flex gap-4">
            <Button onClick={handleNewModel}>Create New Model</Button>
            <Button variant="outline" onClick={handleNewEnum}>Create New Enum</Button>
            <Button variant="secondary" onClick={togglePreview}>Preview Schema</Button>
          </div>
        </div>
      );
    }
    
    const [itemType, itemId] = activeItem.split("-");
    
    if (itemType === "model") {
      const model = schema.models.find(m => m.id === itemId);
      if (model) {
        return (
          <ModelEditor 
            model={model} 
            allModels={schema.models} 
            allEnums={schema.enums}
            onUpdateModel={handleUpdateModel} 
          />
        );
      }
    } else if (itemType === "enum") {
      const enumItem = schema.enums.find(e => e.id === itemId);
      if (enumItem) {
        return <EnumEditor enumData={enumItem} onUpdateEnum={handleUpdateEnum} />;
      }
    } else if (itemType === "datasource" || itemType === "generator") {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <ConfigPreview datasource={schema.datasource} generator={schema.generator} />
          <ConfigEditor 
            type={itemType as "datasource" | "generator"}
            configData={itemType === "datasource" ? schema.datasource : schema.generator} 
            onUpdateConfig={itemType === "datasource" ? handleUpdateDatasource : handleUpdateGenerator as any}
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          models={schema.models}
          enums={schema.enums}
          activeItem={activeItem}
          onSelectItem={handleSelectItem}
          onNewModel={handleNewModel}
          onNewEnum={handleNewEnum}
          onDeleteModel={handleDeleteModel}
          onDeleteEnum={handleDeleteEnum}
          onImport={handleImportSchema}
          onExport={handleExportSchema}
          onPreviewSchema={togglePreview}
          onShowERD={toggleERD}
          getSchemaCode={getSchemaCode}
        />
        
        <div className="flex-1 overflow-y-auto bg-slate-50 pt-0 md:pt-0">
          <div className="px-4 py-4 mt-16 md:mt-0">
            {getActiveContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
