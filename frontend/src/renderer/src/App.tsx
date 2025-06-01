import { useState, useEffect } from "react";
import { TitleBar } from "./components/TitleBar";
import { WorkspacePanel } from "./components/WorkspacePanel";
import { IssuePanel } from "./components/IssuePanel";
import { ChatInterface } from "./components/ChatInterface";
import { EmbeddedBrowser } from "./components/EmbeddedBrowser";
import { StyleEditorPanel } from "./components/StyleEditorPanel";
import { DesignTokensPanel } from "./components/DesignTokensPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { AboutModal } from "./components/AboutModal";

const App: React.FC = () => {
  const [workspacePanelVisible, setWorkspacePanelVisible] = useState<boolean>(true);
  const [issuePanelVisible, setIssuePanelVisible] = useState<boolean>(true);
  const [chatPanelHeight, setChatPanelHeight] = useState<number>(300);
  //@ts-ignore
  const [designTokensPanelVisible, setDesignTokensPanelVisible] = useState<boolean>(true);
  const [styleEditorVisible, setStyleEditorVisible] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [aboutVisible, setAboutVisible] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<any>(null); // Adjust type based on element structure
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("about:blank");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await (window.api as any).getSettings();
      if (settings.theme) {
        setTheme(settings.theme as "dark" | "light");
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const removeProjectOpenedListener = (window.api as any).onProjectOpened((path: string) => {
      setProjectPath(path);
    });

    const removeToggleWorkspacePanelListener = (window.api as any).onToggleWorkspacePanel(() => {
      setWorkspacePanelVisible((prev) => !prev);
    });

    const removeToggleIssuePanelListener = (window.api as any).onToggleIssuePanel(() => {
      setIssuePanelVisible((prev) => !prev);
    });

    const removeOpenSettingsListener = (window.api as any).onOpenSettings(() => {
      console.log("Received open-settings event from main process");
      setSettingsVisible(true);
    });

    const removeShowAboutListener = (window.api as any).onShowAbout(() => {
      console.log("Received show-about event from main process");
      setAboutVisible(true);
    });

    return () => {
      removeProjectOpenedListener();
      removeToggleWorkspacePanelListener();
      removeToggleIssuePanelListener();
      removeOpenSettingsListener();
      removeShowAboutListener();
    };
  }, []);

  return (
    <div className={`h-screen flex flex-col ${theme === "dark" ? "dark" : ""}`}>
      <TitleBar
        onOpenSettings={() => {
          console.log("onOpenSettings called, setting settingsVisible to true");
          setSettingsVisible(true);
        }}
        onShowAbout={() => {
          console.log("onShowAbout called, setting aboutVisible to true");
          setAboutVisible(true);
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {workspacePanelVisible && (
          <WorkspacePanel projectPath={projectPath} onSelectProject={(path: string) => setProjectPath(path)} />
        )}

        <div className="flex flex-col flex-1 overflow-hidden" style={{ minWidth: "300px" }}>
          <EmbeddedBrowser url={currentUrl} onUrlChange={setCurrentUrl} onSelectElement={setSelectedElement} />

          <div className="relative">
            <ChatInterface chatPanelHeight={chatPanelHeight} setChatPanelHeight={setChatPanelHeight} />
          </div>
        </div>

        {issuePanelVisible && (
          <IssuePanel
            //@ts-ignore
            onHighlightElement={(selector: string) => {
              // Logic to highlight element in browser
            }}
          />
        )}
      </div>

      {styleEditorVisible && (
        <StyleEditorPanel element={selectedElement} onClose={() => setStyleEditorVisible(false)} />
      )}

      {settingsVisible && (
        <>
          <SettingsPanel
            onClose={() => {
              console.log("Closing SettingsPanel");
              setSettingsVisible(false);
            }}
            onThemeChange={(newTheme: "dark" | "light") => {
              setTheme(newTheme);
              (window.api as any).saveSettings({ theme: newTheme });
            }}
          />
        </>
      )}

      {aboutVisible && (
        <>
          <AboutModal
            onClose={() => {
              console.log("Closing AboutModal");
              setAboutVisible(false);
            }}
          />
        </>
      )}

      {designTokensPanelVisible && (
        <div className="absolute bottom-0 right-0 z-10">
          <DesignTokensPanel />
        </div>
      )}
    </div>
  );
};

export default App;