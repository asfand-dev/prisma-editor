
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Check, Code } from "lucide-react";
import { Datasource, Generator } from "@/types/schema";
import { generateConfigCode } from "@/utils/schemaGenerator";
import { useToast } from "@/hooks/use-toast";

interface ConfigPreviewProps {
  datasource: Datasource;
  generator: Generator;
}

const ConfigPreview = ({ datasource, generator }: ConfigPreviewProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  
  const configCode = generateConfigCode(datasource, generator);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(configCode);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Configuration code has been copied to your clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-800">Configuration Preview</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setVisible(!visible)}
        >
          <Code size={14} />
          {visible ? "Hide Code" : "Show Code"}
        </Button>
      </div>
      
      {visible && (
        <div className="relative rounded-md border border-slate-200 bg-slate-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
            <h3 className="text-sm font-medium text-slate-200">config.prisma</h3>
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
          <pre className="p-4 text-sm text-slate-200 overflow-auto max-h-[300px] whitespace-pre-wrap">
            <code>{configCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default ConfigPreview;
