import React, { useState } from "react";
import "./PanContainer.css";

function PanContainer({ children, setIsDraggingAsset, windowPosition }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  // Fallback if windowPosition is not passed or is undefined
  const position = windowPosition || { x: 0, y: 0 };

  const handleMouseDown = (e) => {
    if (e.button === 2 && !isPanning) {
      setIsPanning(true);
      setStartPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - startPoint.x;
    const dy = e.clientY - startPoint.y;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setStartPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      className="pan-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="pan-content"
        style={{
          transform: `translate(${offset.x + position.x}px, ${
            offset.y + position.y
          }px)`,
        }}
      >
        {/* Filter out props that are passed to DOM elements */}
        {React.Children.map(children, (child) => {
          // Ensure setIsDraggingAsset is only passed to non-DOM elements (React components)
          if (child.type && typeof child.type !== "string") {
            return React.cloneElement(child, { setIsDraggingAsset });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export default PanContainer;
