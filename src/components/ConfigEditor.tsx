
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Datasource, Generator } from "@/types/schema";

interface ConfigEditorProps {
  type: "datasource" | "generator";
  configData: Datasource | Generator;
  onUpdateConfig: (updatedConfig: Datasource | Generator) => void;
}

const DATABASE_PROVIDERS = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "sqlserver", label: "SQL Server" },
  { value: "mongodb", label: "MongoDB" },
  { value: "cockroachdb", label: "CockroachDB" },
];

const GENERATOR_PROVIDERS = [
  { value: "prisma-client-js", label: "Prisma Client JS" },
];

const PREVIEW_FEATURES = [
  "extendedWhereUnique",
  "fullTextSearch",
  "fullTextIndex",
  "deno",
  "postgresqlExtensions",
  "views",
  "clientExtensions",
  "metrics",
  "orderByNulls",
  "fieldReference",
  "dataProxy",
  "filteredRelationCount",
  "joinFilteringSameRelation",
];

const BINARY_TARGETS = [
  "native",
  "linux-musl-openssl-3.0.x",
  "linux-musl-openssl-1.1.x",
  "linux-musl",
  "debian-openssl-3.0.x",
  "debian-openssl-1.1.x",
  "debian-openssl-1.0.x",
  "rhel-openssl-3.0.x",
  "rhel-openssl-1.1.x",
  "rhel-openssl-1.0.x",
  "windows",
  "darwin",
  "darwin-arm64",
];

const ConfigEditor = ({ type, configData, onUpdateConfig }: ConfigEditorProps) => {
  const isDatasource = type === "datasource";
  const isGenerator = type === "generator";
  
  const handleProviderChange = (value: string) => {
    if (isDatasource) {
      onUpdateConfig({
        ...configData as Datasource,
        provider: value,
      });
    } else if (isGenerator) {
      onUpdateConfig({
        ...configData as Generator,
        provider: value,
      });
    }
  };

  const handleUrlChange = (value: string) => {
    if (isDatasource) {
      onUpdateConfig({
        ...configData as Datasource,
        url: value,
      });
    }
  };

  const handleOutputChange = (value: string) => {
    if (isGenerator) {
      onUpdateConfig({
        ...configData as Generator,
        output: value,
      });
    }
  };

  const togglePreviewFeature = (feature: string, checked: boolean) => {
    if (isGenerator) {
      const generator = configData as Generator;
      let newPreviewFeatures = [...(generator.previewFeatures || [])];
      
      if (checked) {
        newPreviewFeatures.push(feature);
      } else {
        newPreviewFeatures = newPreviewFeatures.filter(f => f !== feature);
      }
      
      onUpdateConfig({
        ...generator,
        previewFeatures: newPreviewFeatures,
      });
    }
  };

  const addBinaryTarget = (target: string) => {
    if (isGenerator) {
      const generator = configData as Generator;
      const currentTargets = generator.binaryTargets || [];
      
      if (!currentTargets.includes(target)) {
        onUpdateConfig({
          ...generator,
          binaryTargets: [...currentTargets, target],
        });
      }
    }
  };

  const removeBinaryTarget = (target: string) => {
    if (isGenerator) {
      const generator = configData as Generator;
      const currentTargets = generator.binaryTargets || [];
      
      onUpdateConfig({
        ...generator,
        binaryTargets: currentTargets.filter(t => t !== target),
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        {isDatasource ? "Datasource Configuration" : "Generator Configuration"}
      </h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="provider" className="text-sm font-medium text-slate-700 mb-1 block">
            Provider
          </Label>
          <Select
            value={configData.provider}
            onValueChange={handleProviderChange}
          >
            <SelectTrigger id="provider" className="w-full">
              <SelectValue placeholder={`Select ${isDatasource ? 'database' : 'generator'} provider`} />
            </SelectTrigger>
            <SelectContent>
              {isDatasource
                ? DATABASE_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))
                : GENERATOR_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
        </div>
        
        {isDatasource && (
          <div>
            <Label htmlFor="url" className="text-sm font-medium text-slate-700 mb-1 block">
              Database URL
            </Label>
            <Input
              id="url"
              value={(configData as Datasource).url || ""}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder='env("DATABASE_URL")'
              className="font-medium"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use env("DATABASE_URL") to reference an environment variable
            </p>
          </div>
        )}
        
        {isGenerator && (
          <>
            <div>
              <Label htmlFor="output" className="text-sm font-medium text-slate-700 mb-1 block">
                Output Path (Optional)
              </Label>
              <Input
                id="output"
                value={(configData as Generator).output || ""}
                onChange={(e) => handleOutputChange(e.target.value)}
                placeholder="./generated/client"
                className="font-medium"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-3 block">
                Preview Features
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PREVIEW_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={(configData as Generator).previewFeatures?.includes(feature)}
                      onCheckedChange={(checked) => togglePreviewFeature(feature, !!checked)}
                    />
                    <Label htmlFor={`feature-${feature}`} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-3 block">
                Binary Targets
              </Label>
              <Select
                onValueChange={addBinaryTarget}
              >
                <SelectTrigger className="w-full mb-3">
                  <SelectValue placeholder="Add a binary target" />
                </SelectTrigger>
                <SelectContent>
                  {BINARY_TARGETS.map((target) => (
                    <SelectItem key={target} value={target}>
                      {target}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {((configData as Generator).binaryTargets || []).length > 0 ? (
                <div className="space-y-2">
                  {(configData as Generator).binaryTargets?.map((target) => (
                    <div key={target} className="flex justify-between items-center p-2 bg-slate-100 rounded-md">
                      <span className="text-sm">{target}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBinaryTarget(target)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No binary targets selected</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfigEditor;
