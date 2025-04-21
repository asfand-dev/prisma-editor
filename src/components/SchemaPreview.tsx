
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { Schema } from "@/types/schema";
import { generateSchemaCode } from "@/utils/schemaGenerator";
import { useToast } from "@/hooks/use-toast";

interface SchemaPreviewProps {
  schema: Schema;
}

const SchemaPreview = ({ schema }: SchemaPreviewProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const schemaCode = generateSchemaCode(schema);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(schemaCode);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Schema code has been copied to your clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (!schema.models.length && !schema.enums.length) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-300 rounded-md bg-slate-50">
        <p className="text-slate-600 mb-2">Your schema is empty</p>
        <p className="text-slate-500 text-sm">Add models and enums to see the generated Prisma schema</p>
      </div>
    );
  }
  
  return (
    <div className="relative rounded-md border border-slate-200 bg-slate-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-200">schema.prisma</h3>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-xs flex items-center gap-1.5",
            copied ? "text-green-400" : "text-slate-400 hover:text-slate-200"
          )}
          onClick={copyToClipboard}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <pre className="p-4 text-sm text-slate-200 overflow-auto whitespace-pre-wrap">
        <code>{schemaCode}</code>
      </pre>
    </div>
  );
};

export default SchemaPreview;
