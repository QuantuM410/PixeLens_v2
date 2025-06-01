import { useState, JSX } from "react";
import { ChevronUp, ChevronDown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesignToken {
  name: string;
  value: string;
  type: string;
}

export const DesignTokensPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const tokens: DesignToken[] = [
    { name: "--primary-color", value: "#3b82f6", type: "color" },
    { name: "--secondary-color", value: "#10b981", type: "color" },
    { name: "--accent-color", value: "#8b5cf6", type: "color" },
    { name: "--text-color", value: "#f9fafb", type: "color" },
    { name: "--background-color", value: "#1f2937", type: "color" },
    { name: "--border-radius", value: "4px", type: "other" },
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
      return <div className="w-6 h-6 rounded-full border border-gray-600" style={{ backgroundColor: token.value }} />;
    }
    return <span className="text-xs text-gray-400">{token.value}</span>;
  };

  return (
    <div className="w-64 bg-gray-800 border border-gray-700 rounded-tl-lg shadow-lg overflow-hidden">
      <div
        className="p-2 bg-gray-700 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="font-semibold text-white">Design Tokens</h2>
        <Button variant="ghost" size="sm" className="text-white">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </Button>
      </div>
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto p-2">
          <div className="space-y-2">
            {tokens.map((token) => (
              <div
                key={token.name}
                className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                <div className="flex items-center space-x-2">
                  {renderTokenPreview(token)}
                  <span className="text-sm font-mono text-white">{token.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToken(token.name)}
                  className="text-gray-400 hover:text-white"
                  title="Copy token name"
                >
                  {copiedToken === token.name ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};