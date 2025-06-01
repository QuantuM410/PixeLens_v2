import { useState, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface StyleProperty {
  name: string;
  value: string;
  important: boolean;
}

interface StyleEditorPanelProps {
  element: any;
  onClose: () => void;
}

export const StyleEditorPanel: React.FC<StyleEditorPanelProps> = ({ element, onClose }) => {
  const [properties, setProperties] = useState<StyleProperty[]>([]);
  const [newPropertyName, setNewPropertyName] = useState<string>("");
  const [newPropertyValue, setNewPropertyValue] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!element) {
      setProperties([
        { name: "color", value: "hsl(0 0% 98%)", important: false },
        { name: "background-color", value: "hsl(240 5.9% 10%)", important: false },
        { name: "padding", value: "8px 16px", important: false },
        { name: "border-radius", value: "0.5rem", important: false },
        { name: "font-weight", value: "500", important: false },
      ]);
    }
  }, [element]);

  const handlePropertyChange = (index: number, value: string) => {
    const newProperties = [...properties];
    newProperties[index].value = value;
    setProperties(newProperties);
  };

  const handleToggleImportant = (index: number) => {
    const newProperties = [...properties];
    newProperties[index].important = !newProperties[index].important;
    setProperties(newProperties);
  };

  const handleAddProperty = () => {
    if (!newPropertyName || !newPropertyValue) return;

    setProperties([...properties, { name: newPropertyName, value: newPropertyValue, important: false }]);
    setNewPropertyName("");
    setNewPropertyValue("");
  };

  const handleRemoveProperty = (index: number) => {
    const newProperties = [...properties];
    newProperties.splice(index, 1);
    setProperties(newProperties);
  };

  const generateCSSString = (): string => {
    return properties.map((prop) => `${prop.name}: ${prop.value}${prop.important ? " !important" : ""};`).join("\n");
  };

  const handleCopyCSS = () => {
    const css = generateCSSString();
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyChanges = () => {
    console.log("Applying CSS changes:", generateCSSString());
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Style Editor</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 py-4 space-y-4">
          <Card className="bg-card text-card-foreground">
            <CardContent className="p-2">
              <div className="text-sm font-mono">{element ? element.selector : ".button"}</div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {properties.map((prop, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Label className="w-1/3">{prop.name}</Label>
                <Input
                  type="text"
                  value={prop.value}
                  onChange={(e) => handlePropertyChange(index, e.target.value)}
                  className="flex-1 border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  variant={prop.important ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleToggleImportant(index)}
                  title={prop.important ? "Remove !important" : "Add !important"}
                  className={prop.important ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "border-border text-foreground hover:bg-muted"}
                >
                  !
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveProperty(index)}
                  className="border-border text-foreground hover:bg-muted"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
              placeholder="Property"
              className="w-1/3 border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Input
              type="text"
              value={newPropertyValue}
              onChange={(e) => setNewPropertyValue(e.target.value)}
              placeholder="Value"
              className="flex-1 border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Button onClick={handleAddProperty} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add
            </Button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-sm font-medium">CSS Output</Label>
              <Button variant="ghost" size="sm" onClick={handleCopyCSS} className="text-foreground hover:bg-muted">
                {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="bg-muted p-2 rounded text-sm font-mono whitespace-pre-wrap">
              {generateCSSString()}
            </pre>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1 block">Design Tokens</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePropertyChange(
                    properties.findIndex((p) => p.name === "color"),
                    "var(--primary-text)",
                  )
                }
                className="border-border text-foreground hover:bg-muted"
              >
                --primary-text
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePropertyChange(
                    properties.findIndex((p) => p.name === "background-color"),
                    "var(--primary-color)",
                  )
                }
                className="border-border text-foreground hover:bg-muted"
              >
                --primary-color
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePropertyChange(
                    properties.findIndex((p) => p.name === "border-radius"),
                    "var(--border-radius)",
                  )
                }
                className="border-border text-foreground hover:bg-muted"
              >
                --border-radius
              </Button>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border text-foreground hover:bg-muted">
            Cancel
          </Button>
          <Button variant="default" onClick={handleApplyChanges} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};