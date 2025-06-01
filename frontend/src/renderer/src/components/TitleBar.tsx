import { X, Minus, Square, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TitleBarProps {
  onOpenSettings: () => void;
  onShowAbout: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onOpenSettings, onShowAbout }) => {
  const handleMinimize = async () => {
    await (window.api as any).minimizeWindow();
  };

  const handleMaximize = async () => {
    await (window.api as any).maximizeWindow();
  };

  const handleClose = async () => {
    await (window.api as any).closeWindow();
  };

  return (
    <div className="h-10 bg-gray-900 flex items-center justify-between px-2 select-none drag">
      <div className="flex items-center">
        <span className="text-white font-semibold text-lg">PixeLens</span>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            console.log("Settings button clicked");
            onOpenSettings();
          }}
          className="text-gray-400 hover:text-white pointer-events-auto"
          title="Open Settings"
        >
          <Settings size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            console.log("About button clicked");
            onShowAbout();
          }}
          className="text-gray-400 hover:text-white pointer-events-auto"
          title="About PixeLens"
        >
          <Info size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMinimize}
          className="text-gray-400 hover:text-white pointer-events-auto"
        >
          <Minus size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMaximize}
          className="text-gray-400 hover:text-white pointer-events-auto"
        >
          <Square size={13} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-gray-400 hover:text-white pointer-events-auto"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};