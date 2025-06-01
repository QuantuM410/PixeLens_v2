import { useState, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";

interface StyleProperty {
  name: string;
  value: string;
  important: boolean;
}

interface StyleEditorPanelProps {
  element: any; // Adjust type based on element structure
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
        { name: "color", value: "#ffffff", important: false },
        { name: "background-color", value: "#3b82f6", important: false },
        { name: "padding", value: "8px 16px", important: false },
        { name: "border-radius", value: "4px", important: false },
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg w-96 max-w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="font-semibold text-white">Style Editor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-gray-700 p-2 rounded text-sm font-mono text-white">
            {element ? element.selector : ".button"}
          </div>

          <div className="space-y-2">
            {properties.map((prop, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-1/3 text-white">{prop.name}</div>
                <input
                  type="text"
                  value={prop.value}
                  onChange={(e) => handlePropertyChange(index, e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleToggleImportant(index)}
                  className={`text-xs px-1 rounded ${
                    prop.important ? "bg-red-600 text-white" : "bg-gray-700 text-gray-400"
                  }`}
                  title={prop.important ? "Remove !important" : "Add !important"}
                >
                  !
                </button>
                <button onClick={() => handleRemoveProperty(index)} className="text-gray-400 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
              placeholder="Property"
              className="w-1/3 bg-gray-700 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newPropertyValue}
              onChange={(e) => setNewPropertyValue(e.target.value)}
              placeholder="Value"
              className="flex-1 bg-gray-700 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button onClick={handleAddProperty} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500">
              Add
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-white">CSS Output</h3>
              <button onClick={handleCopyCSS} className="text-gray-400 hover:text-white flex items-center text-xs">
                {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="bg-gray-900 p-2 rounded text-sm font-mono text-white whitespace-pre-wrap">
              {generateCSSString()}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-1">Design Tokens</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  handlePropertyChange(
                    properties.findIndex((p) => p.name === "color"),
                    "var(--primary-text)",
                  )
                }
                className="px-2 py-1 bg-gray-700 rounded text-xs text-white hover:bg-gray-600"
              >
                --primary-text
              </button>
              <button
                onClick={() =>
                  handlePropertyChange(
                    properties.findIndex((p) => p.name === "background-color"),
                    "var(--primary-color)",
                  )
                }
                className="px-2 py-1 bg-gray-700 rounded text-xs text-white hover:bg-gray-600"
              >
                --primary-color
              </button>
              <button
                onClick={() =>
                  handlePropertyChange(
                    properties.findIndex((p) => p.name === "border-radius"),
                    "var(--border-radius)",
                  )
                }
                className="px-2 py-1 bg-gray-700 rounded text-xs text-white hover:bg-gray-600"
              >
                --border-radius
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleApplyChanges} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};