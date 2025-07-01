import { useState, useRef, useEffect, JSX } from "react";
import { Send, ThumbsUp, ThumbsDown, X, Sparkles, Maximize2, Minimize2, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      content: "Hello! How can I help you?",
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
  //@ts-ignore
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
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

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: input }
          ]
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response from server');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

  const handleClearChat = () => {
    setMessages([]);
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
                  <div className="bg-muted text-muted-foreground text-xs py-1 px-3 flex justify-between items-center">
                    <span>{language}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary-foreground"
                      onClick={() => navigator.clipboard.writeText(code)}
                    >
                      Copy
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    language={language}
                    style={atomOneDark}
                    className="rounded-b-md text-sm bg-background text-foreground"
                    customStyle={{ margin: 0 }}
                  >
                    {code}
                  </SyntaxHighlighter>
                  <Button
                    variant="default"
                    size="sm"
                    className="absolute top-8 right-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
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
    <Card
      className={`flex flex-col relative border-t border-border ${isExpanded ? "fixed top-4 left-4 right-4 z-50" : "h-full"} bg-background text-foreground rounded-none`}
      style={{ height: isExpanded ? "calc(100vh - 2rem)" : `${chatPanelHeight}px` }}
    >
      {!isExpanded && (
        <div
          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/90 transition-colors z-20"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        />
      )}

      <CardHeader className="flex flex-row items-center justify-between border-b border-border">
        <CardTitle className="flex items-center text-base">
          <Sparkles size={16} className="mr-2 text-primary" />
          Chat
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize" : "Maximize"}
            className="text-foreground hover:bg-muted"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearHistory}
            title="Clear History"
            className="text-foreground hover:bg-muted"
          >
            <X size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            title="Clear Chat"
            className="text-foreground hover:bg-muted"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
                }`}
              >
                <CardContent className="p-0">
                  {renderMessageContent(message.content)}
                  {message.role === "assistant" 
                  // && (
                  //   <div className="flex space-x-1 mt-2">
                  //     <Button
                  //       variant="ghost"
                  //       size="icon"
                  //       onClick={() => handleFeedback(message.id, "thumbs-up")}
                  //       className="hover:text-green-400"
                  //     >
                  //       <ThumbsUp size={14} />
                  //     </Button>
                  //     <Button
                  //       variant="ghost"
                  //       size="icon"
                  //       onClick={() => handleFeedback(message.id, "thumbs-down")}
                  //       className="hover:text-red-400"
                  //     >
                  //       <ThumbsDown size={14} />
                  //     </Button>
                  //   </div>
                  // )
                  }
                </CardContent>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="p-3 bg-card">
                <CardContent className="p-0">
                  <div className="loader w-6 h-6"></div>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <CardContent className="p-3 border-t border-border">
        <div className="flex items-center space-x-2 mb-2">
          <Select value={queryType} onValueChange={setQueryType}>
            <SelectTrigger className="w-40 mt-2 border-border">
              <SelectValue placeholder="Query Type" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground">
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
            className="flex-1 resize-none border-border bg-background text-foreground placeholder:text-muted-foreground"
            rows={2}
          />
          <Button onClick={handleSendMessage} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary">
            <Send size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};