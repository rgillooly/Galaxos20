import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

function AssetMenu({ title, assets, position, onClose, onUpdatePosition }) {
  const [isDragging, setIsDragging] = useState(false);
  const [assetMenuPosition, setAssetMenuPosition] = useState(position);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  // Handle mouse down event to start dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragOffset.current = {
      x: assetMenuPosition.left,
      y: assetMenuPosition.top,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle mouse move event during dragging
  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setAssetMenuPosition({
        top: dragOffset.current.y + dy,
        left: dragOffset.current.x + dx,
      });
    }
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
    dragOffset.current = { x: 0, y: 0 };
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // Update AssetMenu position after dragging if onUpdatePosition is provided
    if (onUpdatePosition) {
      onUpdatePosition(assetMenuPosition);
    }
  };

  return (
    <div
      className="asset-menu"
      style={{
        position: "absolute",
        top: `${assetMenuPosition.top}px`,
        left: `${assetMenuPosition.left}px`,
        zIndex: 1000, // Ensure it's above other content
      }}
      onMouseDown={handleMouseDown}
    >
      <header>
        <h3>{title}</h3>
        <button onClick={onClose}>Close</button>
      </header>

      <div>
        <p>Assets: {assets.length}</p>
        {/* Render assets here */}
      </div>
    </div>
  );
}

AssetMenu.propTypes = {
  title: PropTypes.string.isRequired, // Updated to match the prop in the component
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  assets: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdatePosition: PropTypes.func.isRequired,
};

export default AssetMenu;
