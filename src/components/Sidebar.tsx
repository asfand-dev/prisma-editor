import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Database, 
  Table2, 
  List, 
  Settings, 
  ChevronRight, 
  ChevronDown, 
  Plus,
  Trash,
  FileUp,
  FileDown,
  Eye,
  Code,
  Network,
  Menu,
  X,
  Save
} from "lucide-react";
import { Model, Enum } from "@/types/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  models: Model[];
  enums: Enum[];
  activeItem: string | null;
  onSelectItem: (itemType: "model" | "enum" | "datasource" | "generator", itemId: string) => void;
  onNewModel: () => void;
  onNewEnum: () => void;
  onDeleteModel: (id: string) => void;
  onDeleteEnum: (id: string) => void;
  onImport: (schemaContent: string) => void;
  onExport: () => string | null;
  onPreviewSchema: () => void;
  onShowERD: () => void;
  getSchemaCode: () => string | null;
}

const Sidebar = ({
  models,
  enums,
  activeItem,
  onSelectItem,
  onNewModel,
  onNewEnum,
  onDeleteModel,
  onDeleteEnum,
  onImport,
  onExport,
  onPreviewSchema,
  onShowERD,
  getSchemaCode
}: SidebarProps) => {
  const isMobile = useIsMobile();
  const { isNpxBuild } = useEnvironment();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<{
    models: boolean;
    enums: boolean;
    config: boolean;
  }>({
    models: true,
    enums: true,
    config: true,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSchema = async () => {
    try {
      // Generate schema text from the current state
      const schemaText = getSchemaCode();
      
      if (!schemaText) {
        throw new Error("Failed to generate schema code");
      }
      
      // Send POST request to /schema endpoint
      const response = await fetch('/schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: schemaText,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save schema: ${response.statusText}`);
      }
      
      toast({
        title: "Schema saved",
        description: "Your schema has been saved successfully",
      });
    } catch (error: unknown) {
      console.error("Error saving schema:", error);
      toast({
        title: "Save failed",
        description: "An error occurred while saving the schema",
        variant: "destructive"
      });
    }
  };

  // Close mobile menu when an item is selected
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [activeItem, isMobile]);

  // Load schema from endpoint when in NPX mode
  useEffect(() => {
    const loadSchema = async () => {
      try {
        const response = await fetch('/schema');
        if (!response.ok) {
          throw new Error(`Failed to load schema: ${response.statusText}`);
        }
        const schemaText = await response.text();
        onImport(schemaText);
      } catch (error: unknown) {
        console.error("Error loading schema:", error);
        toast({
          title: "Load failed",
          description: "An error occurred while loading the schema",
          variant: "destructive"
        });
      }
    };

    if (isNpxBuild) {
      loadSchema();
    }
  }, []);

  return (
    <div className="relative">
      {/* Mobile hamburger menu */}
      {isMobile && (
        <div className="fixed top-0 left-0 w-full h-16 z-40 bg-white border-b border-slate-200 flex items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mr-2"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <h2 className="text-lg font-semibold text-slate-800">Prisma Schema Editor</h2>
        </div>
      )}

      <div 
        className={cn(
          "w-64 border-r border-slate-200 h-full bg-white flex flex-col",
          isMobile && "fixed z-30 transition-transform duration-300 shadow-lg",
          isMobile && (mobileMenuOpen ? "translate-x-0 translate-y-[60px]" : "-translate-x-full")
        )}
      >
        {!isMobile && (
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Prisma Schema</h2>
            <p className="text-xs text-slate-500 mt-1">Visual Schema Editor</p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="p-3 border-b border-slate-200 flex flex-wrap gap-2">
          {isNpxBuild ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-xs w-full"
              onClick={handleSaveSchema}
            >
              <Save size={14} />
              Save Schema
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs flex-1"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <FileUp size={14} />
                Import
                <input 
                  id="file-upload" 
                  type="file" 
                  accept=".prisma" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs flex-1"
                onClick={onExport}
              >
                <FileDown size={14} />
                Export
              </Button>
            </>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 text-xs flex-1"
            onClick={onPreviewSchema}
          >
            <Code size={14} />
            Preview
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 text-xs flex-1"
            onClick={onShowERD}
          >
            <Network size={14} />
            ERD Diagram
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Models Section */}
            <div className="mb-4">
              <div
                className="flex items-center justify-between p-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                onClick={() => toggleSection("models")}
              >
                <div className="flex items-center">
                  {expandedSections.models ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Table2 size={16} className="ml-1 mr-2 text-purple-600" />
                  <span>Models</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => { 
                    e.stopPropagation();
                    onNewModel();
                  }}
                >
                  <Plus size={14} />
                </Button>
              </div>
              {expandedSections.models && (
                <div className="ml-7 mt-1">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className={cn(
                        "flex items-center justify-between p-2 text-sm rounded-md cursor-pointer group",
                        activeItem === `model-${model.id}`
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => onSelectItem("model", model.id)}
                    >
                      <span className="truncate">{model.name}</span>
                      <div className={cn(
                        "flex gap-1",
                        activeItem === `model-${model.id}` ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteModel(model.id);
                          }}
                        >
                          <Trash size={12} className="text-slate-500 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {models.length === 0 && (
                    <div className="text-xs text-slate-500 p-2">No models yet</div>
                  )}
                </div>
              )}
            </div>

            {/* Enums Section */}
            <div className="mb-4">
              <div
                className="flex items-center justify-between p-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                onClick={() => toggleSection("enums")}
              >
                <div className="flex items-center">
                  {expandedSections.enums ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <List size={16} className="ml-1 mr-2 text-amber-500" />
                  <span>Enums</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => { 
                    e.stopPropagation();
                    onNewEnum();
                  }}
                >
                  <Plus size={14} />
                </Button>
              </div>
              {expandedSections.enums && (
                <div className="ml-7 mt-1">
                  {enums.map((enumItem) => (
                    <div
                      key={enumItem.id}
                      className={cn(
                        "flex items-center justify-between p-2 text-sm rounded-md cursor-pointer group",
                        activeItem === `enum-${enumItem.id}`
                          ? "bg-amber-100 text-amber-700 font-medium"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => onSelectItem("enum", enumItem.id)}
                    >
                      <span className="truncate">{enumItem.name}</span>
                      <div className={cn(
                        "flex gap-1",
                        activeItem === `enum-${enumItem.id}` ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEnum(enumItem.id);
                          }}
                        >
                          <Trash size={12} className="text-slate-500 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {enums.length === 0 && (
                    <div className="text-xs text-slate-500 p-2">No enums yet</div>
                  )}
                </div>
              )}
            </div>

            {/* Configuration Section */}
            <div className="mb-4">
              <div
                className="flex items-center p-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                onClick={() => toggleSection("config")}
              >
                {expandedSections.config ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Settings size={16} className="ml-1 mr-2 text-teal-600" />
                <span>Configuration</span>
              </div>
              {expandedSections.config && (
                <div className="ml-7 mt-1">
                  <div
                    className={cn(
                      "p-2 text-sm rounded-md cursor-pointer",
                      activeItem === "datasource-db"
                        ? "bg-teal-100 text-teal-700 font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                    onClick={() => onSelectItem("datasource", "db")}
                  >
                    <div className="flex items-center">
                      <Database size={14} className="mr-2" />
                      <span>Datasource</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "p-2 text-sm rounded-md cursor-pointer",
                      activeItem === "generator-client"
                        ? "bg-teal-100 text-teal-700 font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                    onClick={() => onSelectItem("generator", "client")}
                  >
                    <div className="flex items-center">
                      <Settings size={14} className="mr-2" />
                      <span>Generator</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar;
