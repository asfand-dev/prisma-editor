
import { Button } from "@/components/ui/button";
import { Upload, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onImport: (schemaContent: string) => void;
  onExport: () => void;
  onNewModel: () => void;
  schemaValid: boolean;
}

const Header = ({ onImport, onExport, onNewModel, schemaValid }: HeaderProps) => {
  const { toast } = useToast();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
        toast({
          title: "Schema imported",
          description: "The schema was successfully imported",
        });
      } else {
        toast({
          title: "Import failed",
          description: "Could not read the file content",
          variant: "destructive"
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Error reading the file",
        variant: "destructive"
      });
    };
    reader.readAsText(file);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-slate-800 mr-2">Prisma Schema Composer</h1>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Beta</span>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex items-center gap-2" asChild>
          <label className="cursor-pointer">
            <Upload size={16} />
            <span>Import</span>
            <input
              type="file"
              accept=".prisma"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={onExport}
          disabled={!schemaValid}
        >
          <Download size={16} />
          <span>Export</span>
        </Button>
        <Button className="flex items-center gap-2" onClick={onNewModel}>
          <Plus size={16} />
          <span>New Model</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
