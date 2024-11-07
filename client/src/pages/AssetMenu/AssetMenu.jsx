import React, { useState, useEffect } from "react";
import "./AssetMenu.css"; // Optional: Add your styles here

const AssetMenu = ({ name, position, assets, onClose }) => {
  const [localAssets, setLocalAssets] = useState(assets || []); // Manage assets
  const [windowTitle, setWindowTitle] = useState(name); // Corrected to use "name"
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [menuPosition, setMenuPosition] = useState(position); // Set initial position from props

  // Handle mouse down event to start dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - menuPosition.left,
      y: e.clientY - menuPosition.top,
    });
  };

  // Handle mouse move event to drag the menu
  const handleMouseMove = (e) => {
    if (isDragging) {
      setMenuPosition({
        top: e.clientY - offset.y,
        left: e.clientX - offset.x,
      });
    }
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Set up event listeners for dragging
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]); // Effect runs when isDragging changes

  // Handle change in the window title input field
  const handleTitleChange = (e) => {
    setWindowTitle(e.target.value);
  };

  return (
    <div
      className="asset-menu"
      style={{
        position: "absolute",
        top: menuPosition.top,
        left: menuPosition.left,
      }}
      onMouseDown={handleMouseDown}
    >
      <header className="menu-header">
        <input
          type="text"
          value={windowTitle}
          onChange={handleTitleChange}
          placeholder="Asset Menu"
        />
        <button onClick={onClose}>Close</button>
      </header>
      <div className="menu-content">
        <p>Asset Menu content...</p>
      </div>
    </div>
  );
};

export default AssetMenu;
