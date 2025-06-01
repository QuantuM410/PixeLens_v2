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
    } else if (!editMode && !selectedFile) {
      setPanelWidth(originalWidth);
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
          className={`flex items-center py-1 px-2 hover:bg-gray-700 rounded cursor-pointer ${
            selectedFile === node.id ? "bg-blue-600 bg-opacity-40" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(node.id, node.isDirectory)}
          onDoubleClick={() => handleFileDoubleClick(node.id, node.isDirectory)}
        >
          {node.isDirectory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                toggleNode(node.id, node.isDirectory, node.loaded);
              }}
              className="mr-1 text-gray-400 hover:text-white"
            >
              {expandedNodes[node.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          )}
          {node.isDirectory ? (
            expandedNodes[node.id] ? (
              <FolderOpen size={16} className="mr-2 text-yellow-400" />
            ) : (
              <Folder size={16} className="mr-2 text-yellow-400" />
            )
          ) : (
            <File size={16} className="mr-2 text-blue-400" />
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
    <div
      className="bg-gray-800 text-white flex flex-col border-r border-gray-700 shadow-lg relative transition-all duration-200 ease-in-out"
      style={{ width: isCollapsed ? "48px" : `${panelWidth}px` }}
    >
      {!isCollapsed && (
        <div
          className="absolute top-0 right-0 w-2 h-full bg-gray-600/50 cursor-ew-resize hover:bg-blue-500 transition-colors z-20"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        />
      )}

      {isCollapsed ? (
        <div className="flex-1 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="text-gray-400 hover:text-white"
            title="Expand Workspace"
          >
            <ChevronRightIcon size={20} />
          </Button>
        </div>
      ) : (
        <>
          <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-750">
            <h2 className="font-semibold">Workspace</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSelectProject}
                className="bg-blue-600 py-1 text-white hover:bg-blue-500"
              >
                Open
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="text-gray-400 hover:text-white"
                title="Collapse Workspace"
              >
                <ChevronLeft size={20} />
              </Button>
            </div>
          </div>

          <div className="p-2 border-b border-gray-700">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search files..."
                className="w-full bg-gray-700 text-white text-sm rounded pl-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {isSearching && (
                <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                  <div className="loader w-4 h-4"></div>
                </div>
              )}
            </div>
          </div>

          {projectPath ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-auto p-1">
                {loading && treeData.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="loader"></div>
                  </div>
                ) : (
                  <>
                    {isSearching || searchResults.length > 0 ? (
                      <div className="p-2">
                        <h3 className="text-sm font-medium mb-2 text-gray-300">Search Results</h3>
                        {isSearching ? (
                          <div className="flex justify-center py-4">
                            <div className="loader"></div>
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-2">
                            {searchResults.map((result, index) => (
                              <div
                                key={index}
                                className="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
                                onClick={() => setSelectedFile(result.path)}
                              >
                                <div className="text-xs text-blue-400 truncate">{result.path}</div>
                                <div className="text-xs text-gray-400">Line {result.line}</div>
                                <div className="text-sm font-mono mt-1 truncate">{result.preview}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">No results found.</div>
                        )}
                      </div>
                    ) : (
                      renderTree(treeData)
                    )}
                  </>
                )}
              </div>

              {selectedFile && (
                <div className="h-2/5 border-t border-gray-700 overflow-hidden flex flex-col">
                  <div className="p-2 bg-gray-700 text-sm font-medium flex justify-between items-center">
                    <div className="truncate flex-1">{selectedFile.split("/").pop() || selectedFile.split("\\").pop()}</div>
                    <div className="flex space-x-1">
                      {!editMode ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditMode(true)}
                          className="text-gray-400 hover:text-white"
                          title="Edit file"
                        >
                          <Edit size={14} />
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveFile}
                            className="text-green-400 hover:text-green-300"
                            title="Save changes"
                          >
                            <Save size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditMode(false);
                              setEditedContent(fileContent || "");
                            }}
                            className="text-gray-400 hover:text-white"
                            title="Cancel editing"
                          >
                            <X size={14} />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCloseFile}
                        className="text-gray-400 hover:text-white"
                        title="Close file"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex justify-center items-center">
                      <div className="loader"></div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto">
                      {editMode ? (
                        <div
                          contentEditable={true}
                          onInput={(e) => setEditedContent(e.currentTarget.textContent || "")}
                          className="w-full h-full bg-gray-900 text-white p-4 text-sm font-mono focus:outline-none whitespace-pre-wrap"
                          style={{ lineHeight: "1.5", tabSize: 2 }}
                          suppressContentEditableWarning={true}
                        >
                          {editedContent || ""}
                        </div>
                      ) : (
                        <SyntaxHighlighter
                          language={getFileLanguage(selectedFile)}
                          style={atomOneDark}
                          customStyle={{ margin: 0, padding: "1rem", height: "100%", lineHeight: "1.5", tabSize: 2 }}
                          className="text-sm"
                        >
                          {fileContent || ""}
                        </SyntaxHighlighter>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center p-6">
                <Folder size={48} className="mx-auto mb-4 text-gray-500" />
                <p className="mb-4">No project opened</p>
                <Button
                  variant="default"
                  onClick={handleSelectProject}
                  className="bg-blue-600 text-white hover:bg-blue-500"
                >
                  Open Project
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};