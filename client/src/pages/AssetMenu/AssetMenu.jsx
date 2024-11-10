import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import "./AssetMenu.css";

function AssetMenu({ id, title, assets, position = { top: 0, left: 0 }, onClose, onDragStart, onDragEnd, onTitleUpdate }) {
  const [assetMenuPosition, setAssetMenuPosition] = useState(position); // Use state for position updates
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false); // To track if title is being edited
  const [newTitle, setNewTitle] = useState(title); // To store the edited title
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

  // Start editing the title
  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  // Handle title input change
  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  // Save the new title
  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    // Notify the parent to update the title in the backend
    if (onTitleUpdate) {
      onTitleUpdate(id, newTitle); // Passing id and new title to parent
    }
  };

  // Handle blur event (when user clicks away)
  const handleBlur = () => {
    handleSaveTitle();
  };

  // Handle Enter key to save the title
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    }
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
        {isEditingTitle ? (
          <input
            type="text"
            value={newTitle}
            onChange={handleTitleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="edit-input"
          />
        ) : (
          <>
            <h3>{newTitle}</h3>
            <button onClick={handleEditTitle} className="rename-button">
              Rename
            </button>
          </>
        )}
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
  _id: PropTypes.string.isRequired, // Added id for identifying the AssetMenu
  title: PropTypes.string,
  assets: PropTypes.array,
  onClose: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onTitleUpdate: PropTypes.func, // Callback for updating the title
};

export default AssetMenu;
