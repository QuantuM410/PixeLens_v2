import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { RefreshCw, Smartphone, Tablet, Monitor, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmbeddedBrowserProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSelectElement: (element: any) => void;
}

interface ViewportSize {
  width: number;
  height: number;
}

const EmbeddedBrowserInner = (
  { url, onUrlChange, onSelectElement }: EmbeddedBrowserProps,
  ref: React.ForwardedRef<any>
) => {
  const [inputUrl, setInputUrl] = useState<string>(url);
  const [viewportSize, setViewportSize] = useState<ViewportSize | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    async extractDomAndCss() {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) return { html: '', css: '' };
      const doc = iframe.contentDocument;
      const html = doc.body ? doc.body.outerHTML : '';
      // Extract all computed styles as a string
      let css = '';
      try {
        const sheets = Array.from(doc.styleSheets);
        for (const sheet of sheets) {
          try {
            const rules = (sheet as CSSStyleSheet).cssRules;
            for (const rule of Array.from(rules)) {
              css += rule.cssText + '\n';
            }
          } catch (e) { /* ignore CORS issues */ }
        }
      } catch (e) { /* ignore */ }
      return { html, css };
    },
    highlightElement(selector: string) {
      const iframe = iframeRef.current;
      console.log("Iframe:", iframe?.contentDocument);
      if (!iframe || !iframe.contentDocument) return;
      const doc = iframe.contentDocument;
      // Remove any previous highlights
      const prevHighlights = doc.querySelectorAll('.__pixelens-highlight-box');
      prevHighlights.forEach((el) => el.parentNode?.removeChild(el));
      if (!selector) return; // Only remove highlights if selector is empty
      // Find the element(s) to highlight
      const elements = doc.querySelectorAll(selector);
      console.log(`[EmbeddedBrowser] highlightElement: selector='${selector}', found ${elements.length} element(s)`);
      if (elements.length === 0) {
        console.warn(`[EmbeddedBrowser] No elements found for selector: '${selector}'`);
        console.warn(`[EmbeddedBrowser] DOM body:`, doc.body ? doc.body.outerHTML.slice(0, 500) + '...' : 'No body');
      }
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn(`[EmbeddedBrowser] Element has zero size for selector: '${selector}'`, el);
        }
        const highlight = doc.createElement('div');
        highlight.className = '__pixelens-highlight-box';
        // Use position: absolute relative to body, and adjust for scroll
        highlight.style.position = 'absolute';
        highlight.style.left = `${rect.left + doc.documentElement.scrollLeft}px`;
        highlight.style.top = `${rect.top + doc.documentElement.scrollTop}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        highlight.style.border = '3px solid #e53935';
        highlight.style.zIndex = '2147483647';
        highlight.style.pointerEvents = 'none';
        highlight.style.boxSizing = 'border-box';
        highlight.style.background = 'rgba(248, 20, 20, 0.15)';
        highlight.style.borderRadius = '4px';
        doc.body.appendChild(highlight);
      });
    }
  }));

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
    <div className="flex-1 flex flex-col overflow-hidden bg-background text-foreground">
      <Card className="border-b border-border rounded-none">
        <CardContent className="p-2 flex items-center space-x-2 mt-6">
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center space-x-2">
            <Input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter URL (e.g., http://localhost:3000)"
              className="flex-1 border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Go</Button>
          </form>

          <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh" className="border-border text-foreground hover:bg-muted">
            <RefreshCw size={18} />
          </Button>

          <Button variant="outline" size="icon" onClick={() => setViewportPreset("mobile")} title="Mobile View (375x667)" className="border-border text-foreground hover:bg-muted">
            <Smartphone size={18} />
          </Button>

          <Button variant="outline" size="icon" onClick={() => setViewportPreset("tablet")} title="Tablet View (768x1024)" className="border-border text-foreground hover:bg-muted">
            <Tablet size={18} />
          </Button>

          <Button variant="outline" size="icon" onClick={() => setViewportPreset("desktop")} title="Desktop View (Full Width)" className="border-border text-foreground hover:bg-muted">
            <Monitor size={18} />
          </Button>

          <Button variant="outline" size="icon" onClick={openExternal} title="Open in Browser" className="border-border text-foreground hover:bg-muted">
            <ExternalLink size={18} />
          </Button>

          {viewportSize && (
            <span className="text-sm text-muted-foreground">
              {viewportSize.width} × {viewportSize.height}
            </span>
          )}
        </CardContent>
      </Card>

      <div ref={containerRef} className="flex-1 relative bg-background overflow-auto flex justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
            <div className="loader"></div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0 bg-background"
          onLoad={handleIframeLoad}
          title="Embedded Browser"
        />
      </div>
    </div>
  );
};

export const EmbeddedBrowser = forwardRef(EmbeddedBrowserInner);