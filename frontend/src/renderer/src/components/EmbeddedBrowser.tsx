import { useState, useRef, useEffect } from "react";
import { RefreshCw, Smartphone, Tablet, Monitor, ExternalLink } from "lucide-react";

interface EmbeddedBrowserProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSelectElement: (element: any) => void;
}

interface ViewportSize {
  width: number;
  height: number;
}

//@ts-ignore
export const EmbeddedBrowser: React.FC<EmbeddedBrowserProps> = ({ url, onUrlChange, onSelectElement }) => {
  const [inputUrl, setInputUrl] = useState<string>(url);
  const [viewportSize, setViewportSize] = useState<ViewportSize | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setViewportSize({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let processedUrl = inputUrl;
    if (!/^https?:\/\//i.test(inputUrl) && inputUrl !== "about:blank") {
      processedUrl = `http://${inputUrl}`;
    }

    setIsLoading(true);
    onUrlChange(processedUrl);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = url;
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const setViewportPreset = (preset: "mobile" | "tablet" | "desktop") => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    switch (preset) {
      case "mobile":
        container.style.width = "375px";
        container.style.height = "667px";
        break;
      case "tablet":
        container.style.width = "768px";
        container.style.height = "1024px";
        break;
      case "desktop":
        container.style.width = "100%";
        container.style.height = "100%";
        break;
    }

    const { width, height } = container.getBoundingClientRect();
    setViewportSize({ width, height });
  };

  const openExternal = () => {
    if (url && url !== "about:blank") {
      (window.api as any).openExternal(url);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center space-x-2">
        <form onSubmit={handleUrlSubmit} className="flex-1 flex">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL (e.g., http://localhost:3000)"
            className="flex-1 bg-gray-700 text-white px-3 py-1 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded-r hover:bg-blue-500">
            Go
          </button>
        </form>

        <button
          onClick={handleRefresh}
          className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>

        <button
          onClick={() => setViewportPreset("mobile")}
          className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600"
          title="Mobile View (375x667)"
        >
          <Smartphone size={18} />
        </button>

        <button
          onClick={() => setViewportPreset("tablet")}
          className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600"
          title="Tablet View (768x1024)"
        >
          <Tablet size={18} />
        </button>

        <button
          onClick={() => setViewportPreset("desktop")}
          className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600"
          title="Desktop View (Full Width)"
        >
          <Monitor size={18} />
        </button>

        <button
          onClick={openExternal}
          className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600"
          title="Open in Browser"
        >
          <ExternalLink size={18} />
        </button>

        {viewportSize && (
          <div className="text-gray-400 text-sm">
            {viewportSize.width} × {viewportSize.height}
          </div>
        )}
      </div>

      <div ref={containerRef} className="flex-1 relative bg-white overflow-auto flex justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-10">
            <div className="loader"></div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          title="Embedded Browser"
        />
      </div>
    </div>
  );
};