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
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        return <AlertCircle className="text-destructive" size={16} />;
      case "medium":
        return <AlertTriangle className="text-priority-medium" size={16} />;
      case "low":
        return <Info className="text-priority-low" size={16} />;
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
    <Card className="w-90 flex flex-col border-l border-border bg-background text-foreground rounded-none">
      <CardHeader className="border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <CardTitle>Issues</CardTitle>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{activeIssues.length} active</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSort}
              className="rounded-r-none border-border text-foreground hover:bg-muted"
            >
              Sort: {sortBy === "severity" ? "Severity" : "Type"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSortDirection}
              className="rounded-l-none border-border text-foreground hover:bg-muted"
            >
              {sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterType(filterType ? null : "accessibility")}
            className="border-border text-foreground hover:bg-muted"
          >
            <Filter size={14} className="mr-1" />
            {filterType || "All"}
          </Button>
          <Button
            variant={showFixedIssues ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFixedIssues(!showFixedIssues)}
            className={showFixedIssues ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-border text-foreground hover:bg-muted"}
          >
            <CheckCircle size={14} className="mr-1" />
            Fixed
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        {filteredIssues.length > 0 ? (
          <div className="p-2 space-y-2">
            {filteredIssues.map((issue) => (
              <Accordion
                key={issue.id}
                type="single"
                collapsible
                value={expandedIssue === issue.id ? issue.id : undefined}
                onValueChange={(value) => setExpandedIssue(value || null)}
              >
                <AccordionItem value={issue.id} className="border-0 border-border">
                  <AccordionTrigger className="p-3 hover:bg-muted rounded-md">
                    <div className="flex items-start w-full">
                      <div className="mr-4 mt-0.5">{getSeverityIcon(issue.severity)}</div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-sm">{issue.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{issue.type}</Badge>
                          {showFixedIssues && (
                            <Badge variant="default" className="flex items-center bg-primary text-primary-foreground">
                              <CheckCircle size={10} className="mr-1" />
                              Fixed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 pt-1 bg-muted rounded-b-md">
                    <div className="bg-background p-2 rounded text-sm font-mono mb-3 text-xs overflow-x-auto">
                      {issue.fix}
                    </div>
                    <div className="flex space-x-2">
                      {!showFixedIssues ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApplyFix(issue)}
                          className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <CheckCircle size={12} className="mr-1.5" />
                          Apply Fix
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveFixed(issue.id)}
                          className="flex items-center bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          <X size={12} className="mr-1.5" />
                          Remove Fix
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleLocateElement(issue.element)}
                        className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Eye size={12} className="mr-1.5" />
                        Locate
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
            <div className="text-center">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
              <p className="text-sm">No {showFixedIssues ? "fixed" : ""} issues found</p>
              {showFixedIssues && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFixedIssues(false)}
                  className="mt-3 border-border text-foreground hover:bg-muted"
                >
                  Show Active Issues
                </Button>
              )}
            </div>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};