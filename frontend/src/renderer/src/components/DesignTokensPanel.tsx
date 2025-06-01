import { useState, JSX } from "react";
import { Copy, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface DesignToken {
  name: string;
  value: string;
  type: string;
}

export const DesignTokensPanel: React.FC = () => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const tokens: DesignToken[] = [
    { name: "--primary-color", value: "hsl(240 5.9% 10%)", type: "color" },
    { name: "--secondary-color", value: "hsl(240 4.8% 95.9%)", type: "color" },
    { name: "--accent-color", value: "hsl(240 4.8% 95.9%)", type: "color" },
    { name: "--text-color", value: "hsl(0 0% 98%)", type: "color" },
    { name: "--background-color", value: "hsl(240 10% 3.9%)", type: "color" },
    { name: "--border-radius", value: "0.5rem", type: "other" },
    { name: "--spacing-sm", value: "8px", type: "spacing" },
    { name: "--spacing-md", value: "16px", type: "spacing" },
    { name: "--spacing-lg", value: "24px", type: "spacing" },
    { name: "--font-size-sm", value: "14px", type: "typography" },
    { name: "--font-size-md", value: "16px", type: "typography" },
    { name: "--font-size-lg", value: "20px", type: "typography" },
  ];

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const renderTokenPreview = (token: DesignToken): JSX.Element => {
    if (token.type === "color") {
      return <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: token.value }} />;
    }
    return <span className="text-xs text-muted-foreground">{token.value}</span>;
  };

  return (
    <Card className="w-64 bg-background text-foreground border-border">
      <Accordion type="single" collapsible>
        <AccordionItem value="design-tokens" className="border-border">
          <AccordionTrigger className="px-4 py-2 hover:bg-muted">
            <h2 className="font-semibold">Design Tokens</h2>
          </AccordionTrigger>
          <AccordionContent>
            <div className="max-h-64 overflow-y-auto p-2">
              <div className="space-y-2">
                {tokens.map((token) => (
                  <Card key={token.name} className="bg-card text-card-foreground border-border">
                    <CardContent className="flex items-center justify-between p-2">
                      <div className="flex items-center space-x-2">
                        {renderTokenPreview(token)}
                        <span className="text-sm font-mono">{token.name}</span>
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                          {token.type}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyToken(token.name)}
                        title="Copy token name"
                        className="text-foreground hover:bg-muted"
                      >
                        {copiedToken === token.name ? <Check size={14} /> : <Copy size={14} />}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};