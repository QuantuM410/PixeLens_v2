import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface SettingsPanelProps {
  onClose: () => void;
  onThemeChange: (theme: "dark" | "light") => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onThemeChange }) => {
  const [notificationFrequency, setNotificationFrequency] = useState<number>(5);
  const [llmTemperature, setLlmTemperature] = useState<number>(0.7);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
        setTheme(settings.theme as "dark" | "light");
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    const settings = {
      notification_frequency: notificationFrequency.toString(),
      llm_temperature: llmTemperature.toString(),
      theme,
    };

        await (window.api as any).saveSettings(settings);
    onThemeChange(theme);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg w-96 max-w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Notification Frequency (minutes)</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="30"
                value={notificationFrequency}
                onChange={(e) => setNotificationFrequency(Number.parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white">{notificationFrequency}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">LLM Temperature (0.1 - 1.0)</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={llmTemperature}
                onChange={(e) => setLlmTemperature(Number.parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-white">{llmTemperature.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Lower values produce more deterministic outputs, higher values more creative.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Theme</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                  className="mr-2"
                />
                <span className="text-white">Dark</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === "light"}
                  onChange={() => setTheme("light")}
                  className="mr-2"
                />
                <span className="text-white">Light</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleSaveSettings} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};