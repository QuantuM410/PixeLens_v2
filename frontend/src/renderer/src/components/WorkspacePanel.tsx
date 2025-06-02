import { useState, useEffect, useRef, JSX } from "react";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Edit,
  Save,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import html from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Register languages
SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("html", html);
SyntaxHighlighter.registerLanguage("css", css);

// Define types for electron API
interface FileNode {
  path: string;
  name: string;
  isDirectory: boolean;
}

interface TreeNode {
  id: string;
  name: string;
  isDirectory: boolean;
  children?: TreeNode[];
  loaded?: boolean;
}

interface SearchResult {
  path: string;
  line: number;
  preview: string;
}

interface WorkspacePanelProps {
  projectPath: string | null;
  onSelectProject: (path: string) => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ projectPath, onSelectProject }) => {
  const defaultPanelWidth = 288;
  const minWidth = 250;
  const maxWidth = Math.min(600, window.innerWidth * 0.5);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [panelWidth, setPanelWidth] = useState<number>(defaultPanelWidth);
  const [originalWidth, setOriginalWidth] = useState<number>(defaultPanelWidth);
  const [filePanelHeight, setFilePanelHeight] = useState<string>("h-3/5"); // Default height for view mode
  const isResizing = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(panelWidth);

  useEffect(() => {
    if (!projectPath) return;

    const loadProjectFiles = async () => {
      try {
        setLoading(true);
        const files: FileNode[] = await (window.api as any).readDirectory(projectPath);
        const rootNode: TreeNode = {
          id: projectPath,
          name: projectPath.split("/").pop() || projectPath.split("\\").pop() || "Project",
          isDirectory: true,
          children: files.map((file) => ({
            id: file.path,
            name: file.name,
            isDirectory: file.isDirectory,
            children: file.isDirectory ? [] : undefined,
            loaded: false,
          })),
        };

        setTreeData([rootNode]);
        setExpandedNodes((prev) => ({ ...prev, [projectPath]: true }));
        setLoading(false);
      } catch (error) {
        console.error("Error loading project files:", error);
        setLoading(false);
      }
    };

    loadProjectFiles();
  }, [projectPath]);

  useEffect(() => {
    if (!selectedFile) {
      setFileContent(null);
      setEditMode(false);
      setFilePanelHeight("h-3/5"); // Reset to default height when no file is selected
      setPanelWidth(originalWidth);
      return;
    }

    const loadFileContent = async () => {
      try {
        setLoading(true);
        const content: string = await (window.api as any).readFile(selectedFile);
        setFileContent(content);
        setEditedContent(content);
        setLoading(false);
      } catch (error) {
        console.error("Error loading file content:", error);
        setFileContent(null);
        setLoading(false);
      }
    };

    loadFileContent();
  }, [selectedFile, originalWidth]);

  useEffect(() => {
    if (editMode && !isCollapsed) {
      setOriginalWidth(panelWidth);
      setPanelWidth(Math.max(panelWidth, window.innerWidth / 2));
      setFilePanelHeight("h-3/5"); // Increase height in edit mode
    } else if (!editMode && selectedFile) {
      setFilePanelHeight("h-3/5"); // Default height in view mode
    } else if (!editMode && !selectedFile) {
      setPanelWidth(originalWidth);
      setFilePanelHeight("h-3/5"); // Reset when no file is selected
    }
  }, [editMode, selectedFile, panelWidth, originalWidth, isCollapsed]);

  const handleSelectProject = async () => {
    const path: string = await (window.api as any).openFileDialog();
    if (path) {
      onSelectProject(path);
    }
  };

  const toggleNode = async (nodeId: string, isDirectory: boolean, loaded?: boolean) => {
    if (!isDirectory) return;

    setExpandedNodes((prev) => {
      const newState = { ...prev };
      newState[nodeId] = !prev[nodeId];
      return newState;
    });

    if (!loaded && expandedNodes[nodeId] !== true) {
      await loadNodeChildren(nodeId);
    }
  };

  const loadNodeChildren = async (nodeId: string) => {
    try {
      setLoading(true);
      const files: FileNode[] = await (window.api as any).readDirectory(nodeId);

      setTreeData((prevData) => {
        const updateNode = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                children: files.map((file) => ({
                  id: file.path,
                  name: file.name,
                  isDirectory: file.isDirectory,
                  children: file.isDirectory ? [] : undefined,
                  loaded: false,
                })),
                loaded: true,
              };
            } else if (node.children) {
              return {
                ...node,
                children: updateNode(node.children),
              };
            }
            return node;
          });
        };

        return updateNode(prevData);
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading directory:", error);
      setLoading(false);
    }
  };

  const handleFileClick = (nodeId: string, isDirectory: boolean) => {
    if (!isDirectory) {
      setSelectedFile(nodeId);
      setEditMode(false);
    }
  };

  const handleFileDoubleClick = (nodeId: string, isDirectory: boolean) => {
    if (!isDirectory) {
      (window.api as any).openPath(nodeId);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile || !editMode) return;

    try {
      setLoading(true);
      const success: boolean = await (window.api as any).writeFile(selectedFile, editedContent);
      if (success) {
        setFileContent(editedContent);
        setEditMode(false);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error saving file:", error);
      setLoading(false);
    }
  };

  const handleCloseFile = () => {
    setSelectedFile(null);
    setEditMode(false);
    setFileContent(null);
    setEditedContent("");
    setPanelWidth(originalWidth);
  };

  const handleSearch = async () => {
    if (!searchTerm || !projectPath) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const results: SearchResult[] = await (window.api as any).searchFiles(projectPath, searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching files:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return "javascript";
      case "html":
      case "xml":
      case "svg":
        return "html";
      case "css":
      case "scss":
      case "less":
        return "css";
      default:
        return "javascript";
    }
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    isResizing.current = true;
    startX.current = "clientX" in e ? e.clientX : e.touches[0]?.clientX || 0;
    startWidth.current = panelWidth;

    document.body.style.userSelect = "none";
    document.body.style.pointerEvents = "none";

    document.addEventListener("mousemove", handleResizeMove as any);
    document.addEventListener("mouseup", handleResizeEnd);
    document.addEventListener("touchmove", handleResizeMove as any);
    document.addEventListener("touchend", handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing.current) return;

    const currentX = "clientX" in e ? e.clientX : e.touches[0]?.clientX || 0;
    const deltaX = currentX - startX.current;
    const newWidth = Math.min(Math.max(startWidth.current + deltaX, minWidth), maxWidth);
    setPanelWidth(newWidth);
    setOriginalWidth(newWidth);
  };

  const handleResizeEnd = () => {
    isResizing.current = false;

    document.body.style.userSelect = "";
    document.body.style.pointerEvents = "";

    document.removeEventListener("mousemove", handleResizeMove as any);
    document.removeEventListener("mouseup", handleResizeEnd);
    document.removeEventListener("touchmove", handleResizeMove as any);
    document.removeEventListener("touchend", handleResizeEnd);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const renderTree = (nodes: TreeNode[], level: number = 0): JSX.Element[] => {
    return nodes.map((node) => (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center py-1 px-2 rounded cursor-pointer ${
            selectedFile === node.id ? "bg-primary/20" : "hover:bg-muted"
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(node.id, node.isDirectory)}
          onDoubleClick={() => handleFileDoubleClick(node.id, node.isDirectory)}
        >
          {node.isDirectory && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                toggleNode(node.id, node.isDirectory, node.loaded);
              }}
              className="mr-1 text-foreground hover:bg-muted"
            >
              {expandedNodes[node.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          )}
          {node.isDirectory ? (
            expandedNodes[node.id] ? (
              <FolderOpen size={16} className="mr-2 text-yellow-500" />
            ) : (
              <Folder size={16} className="mr-2 text-yellow-500" />
            )
          ) : (
            <File size={16} className="mr-2 text-blue-500" />
          )}
          <span className="truncate text-sm">{node.name}</span>
        </div>

        {node.isDirectory && expandedNodes[node.id] && node.children && node.children.length > 0 && (
          <div>{renderTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <Card
      className="flex flex-col border-r border-border relative transition-all duration-200 ease-in-out bg-background text-foreground rounded-none"
      style={{ width: isCollapsed ? "48px" : `${panelWidth}px` }}
    >
      {!isCollapsed && (
        <div
          className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-primary/90 transition-colors z-20"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        />
      )}

      {isCollapsed ? (
        <div className="flex-1 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            title="Expand Workspace"
            className="text-foreground hover:bg-muted"
          >
            <ChevronRightIcon size={20} />
          </Button>
        </div>
      ) : (
        <>
          <CardHeader className="flex flex-row items-center p-0 justify-between border-b border-border">
            <CardTitle>Workspace</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSelectProject}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Open
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapse}
                title="Collapse Workspace"
                className="text-foreground hover:bg-muted"
              >
                <ChevronLeft size={20} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="border-border">
            <div className="relative p-0 mt-2 align-self-center">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search files..."
                className="w-full text-sm border-border bg-background text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {isSearching && (
                <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                  <div className="loader w-4 h-4"></div>
                </div>
              )}
            </div>
          </CardContent>

          {projectPath ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 p-1">
                {loading && treeData.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="loader"></div>
                  </div>
                ) : (
                  <>
                    {isSearching || searchResults.length > 0 ? (
                      <div className="p-2">
                        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Search Results</h3>
                        {isSearching ? (
                          <div className="flex justify-center py-4">
                            <div className="loader"></div>
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-2">
                            {searchResults.map((result, index) => (
                              <Card
                                key={index}
                                className="p-2 hover:bg-muted cursor-pointer bg-card text-card-foreground"
                                onClick={() => setSelectedFile(result.path)}
                              >
                                <CardContent className="p-0">
                                  <div className="text-xs text-primary truncate">{result.path}</div>
                                  <div className="text-xs text-muted-foreground">Line {result.line}</div>
                                  <div className="text-sm font-mono mt-1 truncate">{result.preview}</div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No results found.</div>
                        )}
                      </div>
                    ) : (
                      renderTree(treeData)
                    )}
                  </>
                )}
              </ScrollArea>

              {selectedFile && (
                <div className={`${filePanelHeight} border-t border-border overflow-hidden flex flex-col ${editMode ? "min-h-96" : ""}`}>
                  <div className="p-2 bg-muted text-sm font-medium flex justify-between items-center shrink-0">
                    <div className="truncate flex-1">{selectedFile.split("/").pop() || selectedFile.split("\\").pop()}</div>
                    <div className="flex space-x-1">
                      {!editMode ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditMode(true)}
                          title="Edit file"
                          className="text-foreground hover:bg-background"
                        >
                          <Edit size={14} />
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSaveFile}
                            title="Save changes"
                            className="text-foreground hover:bg-background"
                          >
                            <Save size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditMode(false);
                              setEditedContent(fileContent || "");
                            }}
                            title="Cancel editing"
                            className="text-foreground hover:bg-background"
                          >
                            <X size={14} />
                          </Button>
                        </>
                      )}
                      {!editMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCloseFile}
                          title="Close file"
                          className="text-foreground hover:bg-background"
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                  {editMode ? (
                    <div className="flex-1 h-full bg-background text-foreground">
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-full p-2 font-mono text-sm border-none outline-none resize-none bg-background text-foreground box-border"
                        style={{ minHeight: "100%" }}
                      />
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 h-full bg-background text-foreground">
                      {fileContent ? (
                        <SyntaxHighlighter
                          language={getFileLanguage(selectedFile)}
                          style={atomOneDark}
                          className="p-2 rounded-none text-sm bg-background text-foreground"
                          customStyle={{ margin: 0, whiteSpace: "pre" }}
                          wrapLongLines={true}
                        >
                          {fileContent}
                        </SyntaxHighlighter>
                      ) : (
                        <div className="p-2 text-muted-foreground">Unable to load file content.</div>
                      )}
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Button onClick={handleSelectProject} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Open Project
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};