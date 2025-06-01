import { X, Minus, Square, Settings, Info, ScanEyeIcon } from "lucide-react";
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
    <div className="h-10 bg-background flex items-center justify-between px-2 select-none drag">
      <div className="flex items-center">
        <ScanEyeIcon className="text-foreground mr-2" size={24} />
        <span className="text-foreground font-semibold text-lg">PixeLens</span>
      </div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            console.log("Settings button clicked");
            onOpenSettings();
          }}
          className="text-foreground hover:bg-muted pointer-events-auto"
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
          className="text-foreground hover:bg-muted pointer-events-auto"
          title="About PixeLens"
        >
          <Info size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMinimize}
          className="text-foreground hover:bg-muted pointer-events-auto"
        >
          <Minus size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMaximize}
          className="text-foreground hover:bg-muted pointer-events-auto"
        >
          <Square size={11} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-foreground hover:bg-muted pointer-events-auto"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};