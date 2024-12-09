import React, { useState } from "react";

function PanContainer({ children }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [isDraggingAsset, setIsDraggingAsset] = useState(false); // Track if an asset is being dragged

  const handleMouseDown = (e) => {
    // Prevent panning if an asset is being dragged
    if (e.button === 2 && !isDraggingAsset) {
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

  // Handle dragging state from child components (AssetMenu)
  const handleAssetDragStart = () => {
    setIsDraggingAsset(true); // Set dragging flag to true when asset starts being dragged
  };

  const handleAssetDragEnd = () => {
    setIsDraggingAsset(false); // Reset dragging flag when asset drag ends
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        cursor: isPanning ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()} // Disable context menu
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* Pass down drag handlers to children */}
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            onAssetDragStart: handleAssetDragStart, // Pass drag start handler
            onAssetDragEnd: handleAssetDragEnd, // Pass drag end handler
          })
        )}
      </div>
    </div>
  );
}

export default PanContainer;
