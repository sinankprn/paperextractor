import { Copy, Check, Download, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ResultsPanel({
  extractions,
  fieldColors,
  onHoverField,
  onExportJSON,
  onExportCSV
}) {
  const [copiedField, setCopiedField] = useState(null);
  const [expandedFields, setExpandedFields] = useState(new Set());

  const copyToClipboard = async (value, identifier) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(identifier);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleExpanded = (fieldName) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldName)) {
      newExpanded.delete(fieldName);
    } else {
      newExpanded.add(fieldName);
    }
    setExpandedFields(newExpanded);
  };

  if (extractions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Extracted fields will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Stats Summary */}
      <div className="mb-3 p-2.5 bg-white rounded-lg border border-gray-300 shadow-sm">
        <div className="text-xs font-semibold text-gray-700">
          {extractions.length} field{extractions.length !== 1 ? 's' : ''} extracted
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={onExportJSON}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          JSON
        </button>
        <button
          onClick={onExportCSV}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          CSV
        </button>
      </div>

      {/* Extracted fields list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {extractions.map((extraction, index) => {
          const color = fieldColors[extraction.fieldName] || COLORS[0];

          // Check if extraction has values array (new format) or single value (legacy)
          const values = extraction.values || [
            {
              value: extraction.value,
              locations: extraction.locations,
              confidence: extraction.confidence
            }
          ];

          const primaryValue = values[0] || { value: "", confidence: 0 };
          const hasMultipleValues = values.length > 1;
          const isExpanded = expandedFields.has(extraction.fieldName);

          return (
            <div
              key={index}
              className="group bg-white border-2 border-gray-300 rounded-lg hover:border-purple-400 hover:shadow-lg transition-all overflow-hidden"
              onMouseEnter={() => primaryValue.snippet && onHoverField(primaryValue.snippet)}
              onMouseLeave={() => onHoverField(null)}
            >
              {/* Primary Value Section */}
              <div className="p-3">
                {/* Field name with color indicator */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-1.5 h-5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    {extraction.fieldName}
                  </span>
                </div>

                {/* Value with copy button */}
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-gray-900 font-semibold break-words leading-relaxed">
                      {Array.isArray(primaryValue.value)
                        ? primaryValue.value.join(', ')
                        : (primaryValue.value || <span className="text-gray-400 italic font-normal text-sm">Not found</span>)}
                    </p>
                  </div>
                  <button
                    className="p-1.5 hover:bg-purple-100 rounded transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={() => copyToClipboard(primaryValue.value, `${extraction.fieldName}-0`)}
                  >
                    {copiedField === `${extraction.fieldName}-0` ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Multiple Values Expansion */}
              {hasMultipleValues && (
                <>
                  <button
                    onClick={() => toggleExpanded(extraction.fieldName)}
                    className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 border-t-2 border-gray-300 transition-all flex items-center justify-between text-xs font-semibold text-gray-700"
                  >
                    <span>+{values.length - 1} more value{values.length - 1 > 1 ? 's' : ''}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t-2 border-gray-300 bg-gray-50">
                      {values.slice(1).map((valueInstance, valueIndex) => {
                        const actualIndex = valueIndex + 1;
                        const valueId = `${extraction.fieldName}-${actualIndex}`;

                        return (
                          <div
                            key={actualIndex}
                            className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-white transition-all group/item"
                            onMouseEnter={() => valueInstance.snippet && onHoverField(valueInstance.snippet)}
                            onMouseLeave={() => onHoverField(null)}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Value {actualIndex + 1}</span>
                                <p className="text-sm text-gray-900 font-semibold break-words">
                                  {Array.isArray(valueInstance.value)
                                    ? valueInstance.value.join(', ')
                                    : valueInstance.value}
                                </p>
                              </div>
                              <button
                                className="p-1 hover:bg-purple-100 rounded transition-all flex-shrink-0 opacity-0 group-hover/item:opacity-100"
                                onClick={() => copyToClipboard(valueInstance.value, valueId)}
                              >
                                {copiedField === valueId ? (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
