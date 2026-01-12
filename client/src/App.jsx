import { useState, useMemo } from "react";
import axios from "axios";
import PdfUploader from "./components/PdfUploader";
import FieldsInput from "./components/FieldsInput";
import PageViewer from "./components/PageViewer";
import ResultsPanel from "./components/ResultsPanel";
import MarkdownViewer from "./components/MarkdownViewer";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export default function App() {
  const [file, setFile] = useState(null);
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [hoveredSnippet, setHoveredSnippet] = useState(null);

  // Assign colors to fields
  const fieldColors = useMemo(() => {
    const colors = {};
    const uniqueFields = [
      ...new Set(result?.extractions?.map((e) => e.fieldName) || []),
    ];
    uniqueFields.forEach((field, index) => {
      colors[field] = COLORS[index % COLORS.length];
    });
    return colors;
  }, [result]);

  const handleExtract = async () => {
    if (!file || fields.length === 0) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    // Convert field objects to the format expected by backend
    formData.append("fields", JSON.stringify(fields));

    try {
      const response = await axios.post("/api/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 600000, // 10 minute timeout for large PDFs with many pages
      });
      setResult(response.data);
    } catch (err) {
      console.error("Extraction error:", err);
      setError(
        err.response?.data?.error || "Failed to extract fields from PDF"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setTotalPages(1);
  };

  const exportJSON = () => {
    if (!result) return;
    const data = JSON.stringify(result.extractions, null, 2);
    downloadFile(data, "extractions.json", "application/json");
  };

  const exportCSV = () => {
    if (!result) return;
    const headers = ["Field Name", "Value", "Snippet", "Confidence"];
    const rows = [];

    result.extractions.forEach((extraction) => {
      // Check for values array (new format) or use legacy single value
      const values = extraction.values || [
        {
          value: extraction.value,
          locations: extraction.locations,
          confidence: extraction.confidence,
          snippet: extraction.snippet,
        },
      ];

      values.forEach((valueInstance) => {
        rows.push([
          extraction.fieldName,
          `"${(valueInstance.value || "").toString().replace(/"/g, '""')}"`,
          `"${(valueInstance.snippet || "").replace(/"/g, '""')}"`,
          Math.round((valueInstance.confidence || 0) * 100) + "%",
        ]);
      });
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFile(csv, "extractions.csv", "text/csv");
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-white border-opacity-30 shadow-lg animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Paper Extractor
          </h1>
          <p className="text-gray-700 text-lg">
            Extract structured data from PDFs using advanced AI derendering
          </p>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {!result ? (
          /* Upload and configuration view */
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="glass-effect rounded-2xl p-8 shadow-2xl hover-lift">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Upload PDF
              </h2>
              <PdfUploader
                file={file}
                onFileSelect={setFile}
                onClear={handleClear}
              />
            </div>

            <div className="glass-effect rounded-2xl p-8 shadow-2xl hover-lift">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Define Fields to Extract
              </h2>
              <FieldsInput
                fields={fields}
                onChange={setFields}
                onExtract={handleExtract}
                isLoading={isLoading}
                disabled={!file}
              />
            </div>

            {error && (
              <div className="glass-effect border-2 border-red-400 rounded-2xl p-5 text-red-700 shadow-xl animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results view */
          <div className="relative animate-fade-in">
            {/* Header with New button */}
            <div className="flex items-center justify-between mb-4 glass-effect rounded-xl p-4 shadow-md">
              <h2 className="text-2xl font-bold gradient-text">
                Extraction Results
              </h2>
              <button
                onClick={handleClear}
                className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-purple-500"
              >
                New Extraction
              </button>
            </div>

            <div className="flex gap-4 h-[calc(100vh-220px)]">
              {/* Page viewer - left side */}
              <div className="flex-1 glass-effect rounded-xl p-4 shadow-lg overflow-hidden">
                <PageViewer
                  images={result.images}
                  extractions={result.extractions}
                  hoveredField={hoveredSnippet}
                  fieldColors={fieldColors}
                  totalPages={totalPages}
                  setTotalPages={setTotalPages}
                />
              </div>

              {/* Markdown viewer - middle */}
              <div className="flex-1 glass-effect rounded-xl p-4 shadow-lg overflow-hidden">
                <MarkdownViewer
                  ocrText={result.ocrText}
                  hoveredSnippet={hoveredSnippet}
                />
              </div>

              {/* Results panel - right side */}
              <div className="w-96 glass-effect rounded-xl p-4 shadow-lg overflow-hidden flex flex-col">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Extracted Data
                </h3>
                <div className="flex-1 overflow-hidden">
                  <ResultsPanel
                    extractions={result.extractions}
                    fieldColors={fieldColors}
                    onHoverField={setHoveredSnippet}
                    onExportJSON={exportJSON}
                    onExportCSV={exportCSV}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
