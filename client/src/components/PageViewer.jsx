import { useRef, useEffect, useState } from "react";
import { FileText } from "lucide-react";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function PageViewer({
  images,
  extractions,
  hoveredField,
  fieldColors,
  totalPages,
  setTotalPages,
}) {
  const containerRef = useRef(null);
  const imageRefs = useRef([]);
  const [imageData, setImageData] = useState([]); // Array of {width, height} per page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set total pages when images are loaded
  useEffect(() => {
    if (!images) return;
    setTotalPages(images.length);
    setLoading(false);
  }, [images, setTotalPages]);

  // Track image dimensions when they load
  const handleImageLoad = (index, event) => {
    const img = event.target;
    setImageData((prev) => {
      const newData = [...prev];
      newData[index] = {
        width: img.offsetWidth,
        height: img.offsetHeight,
      };
      return newData;
    });
  };

  // Calculate Y offset for a given page number (1-indexed)
  const getPageOffset = (pageNum) => {
    return imageData.slice(0, pageNum - 1).reduce((sum, p) => sum + (p?.height || 0), 0);
  };

  // Transform bounding box coordinates from normalized (0-1000) to pixel coordinates
  const transformBoundingBox = (boundingBox, imageWidth, imageHeight) => {
    const { x, y, width, height } = boundingBox;

    return {
      x: (x / 1000) * imageWidth,
      y: (y / 1000) * imageHeight,
      width: (width / 1000) * imageWidth,
      height: (height / 1000) * imageHeight,
    };
  };

  // Calculate total height of all images
  const totalHeight = imageData.reduce((sum, p) => sum + (p?.height || 0), 0);
  const maxWidth = imageData.length > 0 ? Math.max(...imageData.map((p) => p?.width || 0)) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading PDF...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600 font-medium bg-red-50 px-6 py-4 rounded-xl border-2 border-red-200">{error}</div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 font-medium">No images to display</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-gray-600" />
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">PDF Document</h3>
        {totalPages > 0 && (
          <span className="text-xs text-gray-500">({totalPages} page{totalPages !== 1 ? 's' : ''})</span>
        )}
      </div>

      {/* Continuous scroll container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-start justify-center p-6"
      >
        <div className="relative inline-block shadow-2xl bg-white rounded-lg overflow-hidden">
          {/* Render all page images stacked vertically */}
          <div className="flex flex-col relative">
            {images.map((imageBase64, index) => (
              <img
                key={index}
                ref={(el) => (imageRefs.current[index] = el)}
                src={`data:image/png;base64,${imageBase64}`}
                alt={`Page ${index + 1}`}
                className="block w-full"
                onLoad={(e) => handleImageLoad(index, e)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
