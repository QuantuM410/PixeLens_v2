import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTheme } from "./theme-provider";

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { theme: currentTheme, setTheme } = useTheme();
  const [notificationFrequency, setNotificationFrequency] = useState<number>(5);
  const [llmTemperature, setLlmTemperature] = useState<number>(0.7);
  const [theme, setThemeState] = useState<"dark" | "light" | "system">("dark");

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await (window.api as any).getSettings();

      if (settings.notification_frequency) {
        setNotificationFrequency(Number.parseInt(settings.notification_frequency));
      }

      if (settings.llm_temperature) {
        setLlmTemperature(Number.parseFloat(settings.llm_temperature));
      }

      if (settings.theme) {
        setThemeState(settings.theme as "dark" | "light" | "system");
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    setThemeState(currentTheme);
  }, [currentTheme]);

  const handleSaveSettings = async () => {
    const settings = {
      notification_frequency: notificationFrequency.toString(),
      llm_temperature: llmTemperature.toString(),
      theme,
    };

    await (window.api as any).saveSettings(settings);
    setTheme(theme);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label className="block mb-2">Notification Frequency (minutes)</Label>
            <div className="flex items-center space-x-4">
              <Slider
                min={1}
                max={30}
                value={[notificationFrequency]}
                onValueChange={(value) => setNotificationFrequency(value[0])}
                className="flex-1 ring-primary"
              />
              <span>{notificationFrequency}</span>
            </div>
          </div>

          <div>
            <Label className="block mb-2">LLM Temperature (0.1 - 1.0)</Label>
            <div className="flex items-center space-x-4">
              <Slider
                min={0.1}
                max={1}
                step={0.1}
                value={[llmTemperature]}
                onValueChange={(value) => setLlmTemperature(value[0])}
                className="flex-1 ring-primary"
              />
              <span>{llmTemperature.toFixed(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lower values produce more deterministic outputs, higher values more creative.
            </p>
          </div>

          <div>
            <Label className="block mb-2">Theme</Label>
            <RadioGroup value={theme} onValueChange={(value: "dark" | "light" | "system") => setThemeState(value)}>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" className="border-border text-primary" />
                  <Label htmlFor="dark">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" className="border-border text-primary" />
                  <Label htmlFor="light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" className="border-border text-primary" />
                  <Label htmlFor="system">System</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border text-foreground hover:bg-muted">
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};