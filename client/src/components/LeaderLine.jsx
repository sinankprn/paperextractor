import { useEffect, useState, useRef } from 'react';

export default function LeaderLine({
  show,
  color,
  startElement,
  endBoundingBox,
  containerRef,
  imageRef
}) {
  const [line, setLine] = useState(null);

  useEffect(() => {
    if (!show || !startElement || !endBoundingBox || !containerRef || !imageRef) {
      setLine(null);
      return;
    }

    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) {
      setLine(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const startRect = startElement.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    // Calculate start point (right edge of the results panel item)
    const startX = startRect.left - containerRect.left;
    const startY = startRect.top + startRect.height / 2 - containerRect.top;

    // Calculate end point (center-left of bounding box on image)
    const boxX = (endBoundingBox.x / 1000) * imageRect.width;
    const boxY = (endBoundingBox.y / 1000) * imageRect.height;
    const boxHeight = (endBoundingBox.height / 1000) * imageRect.height;

    const endX = imageRect.left - containerRect.left + boxX;
    const endY = imageRect.top - containerRect.top + boxY + boxHeight / 2;

    setLine({ startX, startY, endX, endY });
  }, [show, startElement, endBoundingBox, containerRef, imageRef]);

  if (!line) return null;

  // Create a curved path
  const midX = (line.startX + line.endX) / 2;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      style={{ overflow: 'visible' }}
    >
      <path
        d={`M ${line.startX} ${line.startY} C ${midX} ${line.startY}, ${midX} ${line.endY}, ${line.endX} ${line.endY}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="5,5"
        className="animate-pulse"
      />
      <circle
        cx={line.endX}
        cy={line.endY}
        r="6"
        fill={color}
        className="animate-ping"
        style={{ animationDuration: '1.5s' }}
      />
      <circle
        cx={line.endX}
        cy={line.endY}
        r="4"
        fill={color}
      />
    </svg>
  );
}
