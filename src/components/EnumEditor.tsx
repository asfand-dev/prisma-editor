
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Enum } from "@/types/schema";
import { Plus, Trash, ArrowDown, ArrowUp, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateEnumCode } from "@/utils/schemaGenerator";

interface EnumEditorProps {
  enumData: Enum;
  onUpdateEnum: (updatedEnum: Enum) => void;
}

const EnumEditor = ({ enumData, onUpdateEnum }: EnumEditorProps) => {
  const [codeView, setCodeView] = useState(false);
  const enumCode = generateEnumCode(enumData);
  
  const updateEnumName = (name: string) => {
    onUpdateEnum({ ...enumData, name });
  };

  const addValue = () => {
    const newValue = `VALUE_${enumData.values.length + 1}`;
    onUpdateEnum({
      ...enumData,
      values: [...enumData.values, newValue],
    });
  };

  const updateValue = (index: number, value: string) => {
    const newValues = [...enumData.values];
    newValues[index] = value;
    onUpdateEnum({
      ...enumData,
      values: newValues,
    });
  };

  const removeValue = (index: number) => {
    const newValues = [...enumData.values];
    newValues.splice(index, 1);
    onUpdateEnum({
      ...enumData,
      values: newValues,
    });
  };

  const moveValue = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === enumData.values.length - 1)
    ) {
      return;
    }

    const newValues = [...enumData.values];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newValues[index], newValues[targetIndex]] = [newValues[targetIndex], newValues[index]];
    
    onUpdateEnum({
      ...enumData,
      values: newValues,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Label htmlFor="enumName" className="text-sm font-medium text-slate-700 mb-1 block">
          Enum Name
        </Label>
        <Input
          id="enumName"
          value={enumData.name}
          onChange={(e) => updateEnumName(e.target.value)}
          className="font-medium text-base"
        />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Values</h3>
          <Button 
            onClick={addValue} 
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600"
          >
            <Plus size={14} />
            Add Value
          </Button>
        </div>

        {enumData.values.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-amber-300 rounded-md bg-amber-50">
            <p className="text-slate-700 mb-4">No values added yet.</p>
            <Button 
              onClick={addValue} 
              variant="outline" 
              className="border-amber-300 text-amber-700"
            >
              <Plus size={16} className="mr-2" /> Add Your First Value
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {enumData.values.map((value, index) => (
              <div
                key={`enum-value-${index}`}
                className="flex items-center space-x-2 p-3 border border-slate-200 rounded-md bg-white"
              >
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => moveValue(index, "up")}
                  disabled={index === 0}
                  className={cn(
                    "h-8 w-8",
                    index === 0 ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  <ArrowUp size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => moveValue(index, "down")}
                  disabled={index === enumData.values.length - 1}
                  className={cn(
                    "h-8 w-8",
                    index === enumData.values.length - 1 ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  <ArrowDown size={14} />
                </Button>
                
                <Input
                  value={value}
                  onChange={(e) => updateValue(index, e.target.value)}
                  className="flex-1"
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-red-500"
                  onClick={() => removeValue(index)}
                >
                  <Trash size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Snippet Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-800">Enum Preview</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setCodeView(!codeView)}
          >
            <Code size={14} />
            {codeView ? "Hide Code" : "Show Code"}
          </Button>
        </div>
        
        {codeView && (
          <div className="relative rounded-md border border-slate-200 bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-700">
              <h3 className="text-sm font-medium text-slate-200">{enumData.name}.prisma</h3>
            </div>
            <pre className="p-4 text-sm text-slate-200 overflow-auto max-h-[300px] whitespace-pre-wrap">
              <code>{enumCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnumEditor;
