import { useState, useRef, useEffect, JSX } from "react";
import { Send, ThumbsUp, ThumbsDown, X, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import html from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("html", html);
SyntaxHighlighter.registerLanguage("css", css);

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  chatPanelHeight: number;
  setChatPanelHeight: (height: number) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatPanelHeight, setChatPanelHeight }) => {
  const minHeight = 200;
  const maxHeight = Math.min(800, window.innerHeight * 0.75);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm PixeLens, your UI debugging assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [queryType, setQueryType] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const isResizing = useRef<boolean>(false);
  const startY = useRef<number>(0);
  const startHeight = useRef<number>(chatPanelHeight);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      let response = "";

      if (input.toLowerCase().includes("alt text")) {
        response =
          'I found an image missing alt text. Here\'s the fix:\n\n```html\n<img src="logo.png" alt="Company Logo">\n```'.replace(
            "<img",
            "<ImageIcon",
          );
      } else if (input.toLowerCase().includes("button")) {
        response =
          "The button styling is inconsistent. Here's the fix:\n\n```css\n.button {\n  padding: 12px 24px;\n  border-radius: 4px;\n  background-color: #3b82f6;\n  color: white;\n}\n```";
      } else {
        response = "I'll analyze your UI for issues. Can you provide more details about what you're looking for?";
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (messageId: string, feedback: string) => {
    console.log("Feedback for message", messageId, ":", feedback);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Chat history cleared. How can I help you?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    isResizing.current = true;
    startY.current = "clientY" in e ? e.clientY : e.touches[0]?.clientY || 0;
    startHeight.current = chatPanelHeight;

    document.body.style.userSelect = "none";
    document.body.style.pointerEvents = "none";

    document.addEventListener("mousemove", handleResizeMove as any);
    document.addEventListener("mouseup", handleResizeEnd);
    document.addEventListener("touchmove", handleResizeMove as any);
    document.addEventListener("touchend", handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing.current) return;

    const currentY = "clientY" in e ? e.clientY : e.touches[0]?.clientY || 0;
    const deltaY = startY.current - currentY;
    const newHeight = Math.min(Math.max(startHeight.current + deltaY, minHeight), maxHeight);
    setChatPanelHeight(newHeight);
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

  const renderMessageContent = (content: string): JSX.Element => {
    if (content.includes("```")) {
      const parts = content.split(/```(\w*)\n/);
      return (
        <>
          {parts.map((part, index) => {
            if (index % 3 === 0) {
              return (
                <p key={index} className="whitespace-pre-wrap">
                  {part}
                </p>
              );
            } else if (index % 3 === 1) {
              return null;
            } else {
              const language = parts[index - 1] || "javascript";
              const code = part.replace(/```$/, "");

              return (
                <div key={index} className="my-2 relative rounded-md overflow-hidden">
                  <div className="bg-gray-900 text-gray-400 text-xs py-1 px-3 flex justify-between items-center">
                    <span>{language}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                      onClick={() => navigator.clipboard.writeText(code)}
                    >
                      Copy
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    language={language}
                    style={atomOneDark}
                    className="rounded-b-md text-sm"
                    customStyle={{ margin: 0 }}
                  >
                    {code}
                  </SyntaxHighlighter>
                  <Button
                    variant="default"
                    size="sm"
                    className="absolute top-8 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-500"
                    onClick={() => console.log("Apply code:", code)}
                  >
                    Apply
                  </Button>
                </div>
              );
            }
          })}
        </>
      );
    }

    return <p className="whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div
      className={`flex flex-col bg-gray-900 border-t border-gray-700 relative transition-all duration-200 ease-in-out ${
        isExpanded ? "fixed inset-0 z-50" : "h-full"
      }`}
      style={{ height: isExpanded ? "100%" : `${chatPanelHeight}px` }}
    >
      {!isExpanded && (
        <div
          className="absolute top-0 left-0 right-0 h-2 bg-gray-600/50 cursor-ns-resize hover:bg-blue-500 transition-colors z-20"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        />
      )}

      <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
        <h2 className="font-semibold text-white flex items-center">
          <Sparkles size={16} className="mr-2 text-blue-400" />
          Chat
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
            title="Clear History"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              {renderMessageContent(message.content)}
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.role === "assistant" && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(message.id, "thumbs-up")}
                      className="text-gray-400 hover:text-green-400 p-1"
                    >
                      <ThumbsUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(message.id, "thumbs-down")}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <ThumbsDown size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="loader w-6 h-6"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2 mb-2">
          <Select value={queryType} onValueChange={setQueryType}>
            <SelectTrigger className="w-40 bg-gray-700 text-white border-gray-600">
              <SelectValue placeholder="Query Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="accessibility">Accessibility</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="styling">Styling</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about UI issues, accessibility, or styling..."
            className="flex-1 bg-gray-700 text-white border-gray-600 focus:ring-blue-500 resize-none"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white hover:bg-blue-500 p-2 rounded"
            disabled={isLoading}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};