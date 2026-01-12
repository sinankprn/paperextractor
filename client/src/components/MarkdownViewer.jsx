import { FileText, Copy, Check } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

export default function MarkdownViewer({ ocrText, hoveredSnippet }) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Highlight text based on hovered snippet
  const highlightedContent = useMemo(() => {
    if (!ocrText || !hoveredSnippet) {
      return ocrText;
    }

    // Escape special regex characters in snippet
    const escapedSnippet = hoveredSnippet.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // Create case-insensitive regex to find all matches with capturing group
    const regex = new RegExp(`(${escapedSnippet})`, "gi");

    // Split text by regex - captured groups are included in the array
    const parts = ocrText.split(regex);

    return parts.map((part, index) => {
      // When splitting with a capturing group, matched parts are included
      // Check if this part matches the snippet (case-insensitive comparison)
      if (part && part.toLowerCase() === hoveredSnippet.toLowerCase()) {
        return (
          <mark key={index} className="highlight-match">
            {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [ocrText, hoveredSnippet]);

  // Auto-scroll to first match when snippet changes
  useEffect(() => {
    if (hoveredSnippet && containerRef.current) {
      const firstMatch = containerRef.current.querySelector(".highlight-match");
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [hoveredSnippet]);

  if (!ocrText) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">OCR text will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Derendered Text
          </h3>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-100 rounded transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-600" />
              <span className="text-green-600">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy All
            </>
          )}
        </button>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-white rounded-lg border border-gray-200 p-4 font-mono text-xs text-gray-700 leading-relaxed whitespace-pre-wrap selection:bg-purple-200 hover:border-gray-300 transition-colors"
      >
        {highlightedContent}
      </div>
    </div>
  );
}
