import { useState, JSX } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Filter,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  X,
  Eye,
} from "lucide-react";

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  type: string;
  element: string;
  fix: string;
}

interface IssuePanelProps {
  onHighlightElement: (selector: string) => void;
}

export const IssuePanel: React.FC<IssuePanelProps> = ({ onHighlightElement }) => {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"severity" | "type">("severity");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [fixedIssues, setFixedIssues] = useState<string[]>([]);
  const [showFixedIssues, setShowFixedIssues] = useState<boolean>(false);

  const issues: Issue[] = [
    {
      id: "1",
      title: "Missing Alt Text",
      description: "WCAG 2.1 violation: Image lacks alt attribute",
      severity: "high",
      type: "accessibility",
      element: "img.logo",
      fix: '<img src="logo.png" alt="Company Logo">',
    },
    {
      id: "2",
      title: "Low Contrast Text",
      description: "WCAG 2.1 violation: Text contrast ratio is below 4.5:1",
      severity: "medium",
      type: "accessibility",
      element: ".hero-text",
      fix: "color: #121212; background-color: #ffffff;",
    },
    {
      id: "3",
      title: "Inconsistent Button Styling",
      description: "Button styling differs from design system",
      severity: "low",
      type: "styling",
      element: ".cta-button",
      fix: "padding: 12px 24px; border-radius: 4px;",
    },
    {
      id: "4",
      title: "Large Image Size",
      description: "Image is not optimized for web",
      severity: "medium",
      type: "performance",
      element: ".hero-image",
      fix: "Compress image to reduce file size by 70%",
    },
  ];

  const activeIssues = issues.filter((issue) => !fixedIssues.includes(issue.id));

  const filteredIssues = (
    showFixedIssues ? fixedIssues.map((id) => issues.find((issue) => issue.id === id)) : activeIssues
  )
    .filter((issue): issue is Issue => !!issue && (!filterType || issue.type === filterType))
    .sort((a, b) => {
      const aValue = sortBy === "severity" ? getSeverityValue(a.severity) : a.type;
      const bValue = sortBy === "severity" ? getSeverityValue(b.severity) : b.type;

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  function getSeverityValue(severity: string): number {
    switch (severity) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  }

  function getSeverityIcon(severity: string): JSX.Element | null {
    switch (severity) {
      case "high":
        return <AlertCircle className="text-red-500" size={16} />;
      case "medium":
        return <AlertTriangle className="text-orange-500" size={16} />;
      case "low":
        return <Info className="text-yellow-500" size={16} />;
      default:
        return null;
    }
  }

  function handleToggleSort() {
    if (sortBy === "severity") {
      setSortBy("type");
    } else {
      setSortBy("severity");
    }
  }

  function handleToggleSortDirection() {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  }

  function handleApplyFix(issue: Issue) {
    console.log("Applying fix:", issue.fix);
    setFixedIssues((prev) => [...prev, issue.id]);
    setExpandedIssue(null);
  }

  function handleLocateElement(selector: string) {
    onHighlightElement(selector);
  }

  function handleRemoveFixed(issueId: string) {
    setFixedIssues((prev) => prev.filter((id) => id !== issueId));
  }

  return (
    <div className="w-80 bg-gray-800 text-white flex flex-col border-l border-gray-700 shadow-lg">
      <div className="p-3 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Issues</h2>
          <div className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{activeIssues.length} active</div>
        </div>
        <div className="flex mt-3 text-sm">
          <div className="flex items-center mr-2">
            <button
              onClick={handleToggleSort}
              className="flex items-center px-2 py-1 bg-gray-700 rounded-l hover:bg-gray-600 text-xs"
            >
              Sort: {sortBy === "severity" ? "Severity" : "Type"}
            </button>
            <button
              onClick={handleToggleSortDirection}
              className="px-2 py-1 bg-gray-700 rounded-r hover:bg-gray-600 text-xs"
            >
              {sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </button>
          </div>
          <div className="relative mr-2">
            <button
              onClick={() => setFilterType(filterType ? null : "accessibility")}
              className="flex items-center px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-xs"
            >
              <Filter size={14} className="mr-1" />
              {filterType || "All"}
            </button>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setShowFixedIssues(!showFixedIssues)}
              className={`flex items-center px-2 py-1 rounded text-xs ${
                showFixedIssues ? "bg-green-700 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <CheckCircle size={14} className="mr-1" />
              Fixed
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredIssues.length > 0 ? (
          <div className="p-2 space-y-2">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`bg-gray-750 rounded-md overflow-hidden border border-gray-700 shadow-sm ${
                  showFixedIssues ? "opacity-70" : ""
                }`}
              >
                <div
                  className="p-3 flex items-start cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                >
                  <div className="mr-4 mt-0.5">{getSeverityIcon(issue.severity)}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{issue.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{issue.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">{issue.type}</span>
                      {showFixedIssues && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-green-800 rounded-full text-green-200 flex items-center">
                          <CheckCircle size={10} className="mr-1" />
                          Fixed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {expandedIssue === issue.id && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-700 bg-gray-800">
                    <div className="bg-gray-900 p-2 rounded text-sm font-mono mb-3 text-xs overflow-x-auto">
                      {issue.fix}
                    </div>
                    <div className="flex space-x-2">
                      {!showFixedIssues ? (
                        <button
                          onClick={() => handleApplyFix(issue)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-500 transition-colors flex items-center"
                        >
                          <CheckCircle size={12} className="mr-1.5" />
                          Apply Fix
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveFixed(issue.id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-500 transition-colors flex items-center"
                        >
                          <X size={12} className="mr-1.5" />
                          Remove Fix
                        </button>
                      )}
                      <button
                        onClick={() => handleLocateElement(issue.element)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-500 transition-colors flex items-center"
                      >
                        <Eye size={12} className="mr-1.5" />
                        Locate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 p-4">
            <div className="text-center">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
              <p className="text-sm">No {showFixedIssues ? "fixed" : ""} issues found</p>
              {showFixedIssues && (
                <button
                  onClick={() => setShowFixedIssues(false)}
                  className="mt-3 px-3 py-1.5 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                >
                  Show Active Issues
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};