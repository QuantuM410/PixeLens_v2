import { useState, useEffect, useRef } from "react";
import { TitleBar } from "./components/TitleBar";
import { WorkspacePanel } from "./components/WorkspacePanel";
import { IssuePanel } from "./components/IssuePanel";
import { ChatInterface } from "./components/ChatInterface";
import { EmbeddedBrowser } from "./components/EmbeddedBrowser";
import { StyleEditorPanel } from "./components/StyleEditorPanel";
import { DesignTokensPanel } from "./components/DesignTokensPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { AboutModal } from "./components/AboutModal";
import { ThemeProvider } from "./components/theme-provider";
import "./assets/index.css";

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
  const [scannedIssues, setScannedIssues] = useState<any[]>([]);
  const embeddedBrowserRef = useRef<any>(null);
  const workspacePanelRef = useRef<any>(null);

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

  // --- Scan UI for Issues logic ---
  const handleScanUI = async () => {
    if (embeddedBrowserRef.current && embeddedBrowserRef.current.extractDomAndCss) {
      const { html, css } = await embeddedBrowserRef.current.extractDomAndCss();
      const response = await fetch("http://localhost:3000/api/scan-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, css })
      });
      const data = await response.json();
      setScannedIssues(data.issues || []);
    }
  };

  // --- Apply Fix logic ---
  const handleApplyFix = async (issue: any) => {
    if (!projectPath) {
      alert("Please open a project first.");
      return;
    }

    try {
      console.log("Applying fix for issue:", issue);
      const result = await (window.api as any).findAndApplyFix(projectPath, issue);
      
      if (result.success) {
        // Show success notification
        await (window.api as any).showNotification(
          "Fix Applied Successfully", 
          `Fix applied to ${result.filePath} at line ${result.line}`
        );
        
        // Refresh the file content in workspace panel if it's the same file
        if (workspacePanelRef.current && workspacePanelRef.current.refreshFileContent) {
          workspacePanelRef.current.refreshFileContent(result.filePath);
        }
        
        // Optionally highlight the fixed element in the browser
        if (embeddedBrowserRef.current && embeddedBrowserRef.current.highlightElement) {
          embeddedBrowserRef.current.highlightElement(issue.element);
        }
      } else {
        // Show manual application dialog
        if (result.searchResults && result.searchResults.length > 0) {
          const confirmed = confirm(
            `${result.message}\n\nFound ${result.searchResults.length} potential matches. Would you like to open the first match for manual editing?`
          );
          
          if (confirmed && result.searchResults[0]) {
            const { path, line } = result.searchResults[0];
            if (workspacePanelRef.current && workspacePanelRef.current.handleApplyFixToFile) {
              workspacePanelRef.current.handleApplyFixToFile(path, line, issue.suggestedFix);
            }
          }
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error("Error applying fix:", error);
      alert("An error occurred while applying the fix. Please try again.");
    }
  };

  // --- Locate logic ---
  const handleLocate = async (issue: any) => {
    console.log(issue)
    if (!projectPath) return;
    // Highlight in embedded browser
    if (embeddedBrowserRef.current && embeddedBrowserRef.current.highlightElement) {
      console.log("Highlighting element:", issue.element);
      embeddedBrowserRef.current.highlightElement(issue.element);
    }
    // Search and highlight in code
    const searchTerm = issue.element || issue.suggestedFix;
    const results = await (window.api as any).searchFiles(projectPath, searchTerm);
    if (results && results.length > 0) {
      const { path, line } = results[0];
      if (workspacePanelRef.current && workspacePanelRef.current.handleHighlightInFile) {
        workspacePanelRef.current.handleHighlightInFile(path, line);
      }
    }
  };

  return (
    <ThemeProvider defaultTheme="dark">
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
            <WorkspacePanel
              projectPath={projectPath}
              onSelectProject={(path: string) => setProjectPath(path)}
              ref={workspacePanelRef}
            />
          )}

          <div className="flex flex-col flex-1 overflow-hidden" style={{ minWidth: "300px" }}>
            <EmbeddedBrowser ref={embeddedBrowserRef} url={currentUrl} onUrlChange={setCurrentUrl} onSelectElement={setSelectedElement} />

            <div className="relative">
              <ChatInterface chatPanelHeight={chatPanelHeight} setChatPanelHeight={setChatPanelHeight} />
            </div>
          </div>

          {issuePanelVisible && (
            <IssuePanel
              onHighlightElement={(selector: string) => {
                // fallback highlight in browser only
                if (embeddedBrowserRef.current && embeddedBrowserRef.current.highlightElement) {
                  embeddedBrowserRef.current.highlightElement(selector);
                }
              }}
              onScanUI={handleScanUI}
              issues={scannedIssues}
              onApplyFix={handleApplyFix}
              onLocate={handleLocate}
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
    </ThemeProvider>
  );
};

export default App;