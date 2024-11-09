import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import "./AssetMenu.css";

function AssetMenu({ title, assets, position = { top: 0, left: 0 }, onClose, onDragStart, onDragEnd }) {
  const [assetMenuPosition, setAssetMenuPosition] = useState(position); // Use state for position updates
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Handle mouse down event for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - assetMenuPosition.left, y: e.clientY - assetMenuPosition.top };
    if (onDragStart) onDragStart();
    // Add event listeners to handle dragging
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle mouse move event
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newLeft = e.clientX - dragStart.current.x;
      const newTop = e.clientY - dragStart.current.y;
      setAssetMenuPosition({ top: newTop, left: newLeft });
    }
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="asset-menu"
      style={{
        zIndex: 1000, // Ensure it's above other content
      }}
      onMouseDown={handleMouseDown}
    >
      <header className="asset-menu-header">
        <h3>{title}</h3>
        <button onClick={onClose}>Close</button>
      </header>
      <div className="asset-menu-content">
        <ul>
          {assets?.length > 0 ? (
            assets.map((asset) => <li key={asset._id}>{asset.name}</li>)
          ) : (
            <li>No assets available</li>
          )}
        </ul>
      </div>
    </div>
  );
}

AssetMenu.propTypes = {
  title: PropTypes.string,
  assets: PropTypes.array,
  onClose: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
};

export default AssetMenu;
