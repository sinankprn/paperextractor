import { useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export default function PdfUploader({ file, onFileSelect, onClear }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      onFileSelect(droppedFile);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  if (file) {
    return (
      <div className="border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 flex items-center justify-between shadow-md hover-lift">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <FileText className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-2 hover:bg-red-100 rounded-full transition-all"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-3 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer bg-gradient-to-br from-purple-50 via-white to-blue-50"
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileInput}
        className="hidden"
        id="pdf-upload"
      />
      <label htmlFor="pdf-upload" className="cursor-pointer">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <p className="text-xl font-semibold text-gray-800 mb-2">
          Drop your PDF here or click to browse
        </p>
        <p className="text-sm text-gray-600">
          Supports PDF files up to 50MB
        </p>
      </label>
    </div>
  );
}
