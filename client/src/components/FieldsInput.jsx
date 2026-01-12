import { useState } from 'react';
import { Plus, X, Sparkles, Info, ChevronDown, ChevronUp, Type, Hash, Calendar, ToggleLeft, FileText, Target } from 'lucide-react';

const DATA_TYPES = [
  { value: 'text', label: 'Text', icon: Type, color: 'text-blue-600' },
  { value: 'number', label: 'Number', icon: Hash, color: 'text-green-600' },
  { value: 'date', label: 'Date', icon: Calendar, color: 'text-purple-600' },
  { value: 'boolean', label: 'Yes/No', icon: ToggleLeft, color: 'text-orange-600' },
  { value: 'list', label: 'List', icon: FileText, color: 'text-pink-600' },
];

export default function FieldsInput({ fields, onChange, onExtract, isLoading, disabled }) {
  const [newField, setNewField] = useState('');
  const [newMetadata, setNewMetadata] = useState('');
  const [newDataType, setNewDataType] = useState('text');
  const [focusMainStudy, setFocusMainStudy] = useState(false);
  const [expandedFields, setExpandedFields] = useState(new Set());

  const addField = () => {
    const trimmed = newField.trim();
    if (trimmed && !fields.some(f => f.name === trimmed)) {
      // Build metadata with focus instruction if needed
      let finalMetadata = newMetadata.trim();
      if (focusMainStudy) {
        const focusInstruction = "IMPORTANT: Extract ONLY from the PRIMARY/MAIN study described in this document. DO NOT extract from: cited studies, referenced papers, related work, comparison studies, or prior research mentioned in the text. Focus exclusively on the current study's own data.";
        finalMetadata = finalMetadata
          ? `${focusInstruction} ${finalMetadata}`
          : focusInstruction;
      }

      onChange([...fields, {
        name: trimmed,
        metadata: finalMetadata,
        dataType: newDataType,
        focusMainStudy: focusMainStudy
      }]);
      setNewField('');
      setNewMetadata('');
      setNewDataType('text');
      setFocusMainStudy(false);
    }
  };

  const removeField = (index) => {
    onChange(fields.filter((_, i) => i !== index));
    const newExpanded = new Set(expandedFields);
    newExpanded.delete(index);
    setExpandedFields(newExpanded);
  };

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFields(newExpanded);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.name === 'fieldName') {
      e.preventDefault();
      addField();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Fields to Extract
        </label>

        {/* Field Name Input */}
        <div className="flex gap-2">
          <input
            type="text"
            name="fieldName"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Invoice Number, Date, Total..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            disabled={isLoading}
          />
          <button
            onClick={addField}
            disabled={!newField.trim() || isLoading}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Data Type Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Data Type</label>
          <div className="grid grid-cols-5 gap-2">
            {DATA_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = newDataType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setNewDataType(type.value)}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? type.color : 'text-gray-400'}`} />
                  <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Metadata Input */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-2">Additional Context (Optional)</label>
          <textarea
            value={newMetadata}
            onChange={(e) => setNewMetadata(e.target.value)}
            placeholder="e.g., 'Format: MM/DD/YYYY', 'Should be in the header section', 'Comma-separated values'..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
            rows="2"
            disabled={isLoading}
          />
          <div className="absolute top-7 right-2">
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
                Add helpful context about this field to improve AI extraction accuracy
              </div>
            </div>
          </div>
        </div>

        {/* Focus on Main Study Checkbox */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <input
            type="checkbox"
            id="focusMainStudy"
            checked={focusMainStudy}
            onChange={(e) => setFocusMainStudy(e.target.checked)}
            disabled={isLoading}
            className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="focusMainStudy" className="flex-1 cursor-pointer">
            <div className="text-sm font-semibold text-gray-800 mb-0.5">
              Focus on main study only
            </div>
            <div className="text-xs text-gray-600">
              Ignore data from cited or referenced studies. Recommended for research papers.
            </div>
          </label>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const dataTypeInfo = DATA_TYPES.find(t => t.value === field.dataType) || DATA_TYPES[0];
            const DataTypeIcon = dataTypeInfo.icon;

            return (
              <div
                key={index}
                className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl overflow-hidden hover-lift"
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
                    <span className="font-medium text-gray-900">{field.name}</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white border ${dataTypeInfo.color}`}>
                      <DataTypeIcon className="w-3 h-3" />
                      {dataTypeInfo.label}
                    </span>
                    {field.focusMainStudy && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 border border-amber-300 text-amber-700">
                        <Target className="w-3 h-3" />
                        Main study
                      </span>
                    )}
                    {(field.metadata || field.dataType) && (
                      <button
                        onClick={() => toggleExpand(index)}
                        className="p-1 hover:bg-purple-200 rounded-full transition-colors"
                        disabled={isLoading}
                      >
                        {expandedFields.has(index) ? (
                          <ChevronUp className="w-4 h-4 text-purple-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-purple-600" />
                        )}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => removeField(index)}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                {expandedFields.has(index) && (
                  <div className="px-3 pb-3 pt-0 space-y-2">
                    <div className="bg-white bg-opacity-60 rounded-lg p-2 text-sm text-gray-700 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <DataTypeIcon className={`w-4 h-4 ${dataTypeInfo.color}`} />
                        <span className="font-medium text-purple-700">Type:</span>
                        <span>{dataTypeInfo.label}</span>
                      </div>
                      {field.focusMainStudy && (
                        <div className="mt-2 pt-2 border-t border-purple-200">
                          <div className="flex items-center gap-2 text-amber-700">
                            <Target className="w-4 h-4" />
                            <span className="font-medium">Focus on main study enabled</span>
                          </div>
                        </div>
                      )}
                      {field.metadata && (
                        <div className="mt-2 pt-2 border-t border-purple-200">
                          <span className="font-medium text-purple-700">Context: </span>
                          {field.metadata}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onExtract}
        disabled={disabled || fields.length === 0 || isLoading}
        className="w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl bg-[length:200%_100%] hover:bg-right-bottom"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Extracting with AI...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Extract Fields with AI
          </>
        )}
      </button>
    </div>
  );
}
