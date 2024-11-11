import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./AssetMenu.css";

function AssetMenu({
  id,
  title,
  assets = [],
  position = { top: 0, left: 0 },
  onClose,
  onDragStart,
  onDragEnd,
  onTitleUpdate,
  onDrop, // Add onDrop callback to notify parent about the drop
}) {
  const [assetMenuPosition, setAssetMenuPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - assetMenuPosition.left, y: e.clientY - assetMenuPosition.top };
    if (onDragStart) onDragStart();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newLeft = e.clientX - dragStart.current.x;
      const newTop = e.clientY - dragStart.current.y;
      setAssetMenuPosition({ top: newTop, left: newLeft });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
    if (onDrop) onDrop(id, assetMenuPosition); // Notify parent of the drop
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!newTitle.trim()) {
      console.error("Title is required and cannot be empty.");
      setNewTitle(title); // Reset to original title
      setIsEditingTitle(false);
      return;
    }
  
    setIsEditingTitle(false);
  
    try {
      const token = localStorage.getItem("token");
      
      // Ensure we're sending the correct data in the body (title and id)
      const response = await axios.put(
        `http://localhost:3001/api/assetMenus/${id}`,  // Make sure this URL is correct
        { title: newTitle },  // Title to be updated
        { headers: { Authorization: `Bearer ${token}` } }  // Pass token in the header if needed
      );
  
      if (response.status === 200) {
        // Successfully updated title in the backend
        console.log("Title updated:", response.data);
        if (onTitleUpdate) {
          // Pass both id and newTitle to the parent
          onTitleUpdate(id, newTitle);
        }
      }
    } catch (error) {
      console.error("Error saving the title:", error.response ? error.response.data : error);
    }
  };
      
  const handleBlur = () => {
    if (isEditingTitle) handleSaveTitle();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSaveTitle();
  };

  return (
    <div
      className="asset-menu"
      onMouseDown={handleMouseDown}
      style={{ top: `${assetMenuPosition.top}px`, left: `${assetMenuPosition.left}px` }}
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
          <h3 onClick={handleEditTitle}>{newTitle}</h3>
        )}
        <button onClick={onClose}>Close</button>
      </header>
      <div className="asset-menu-content">
        <ul>
          {assets.length > 0 ? (
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
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  assets: PropTypes.array,
  position: PropTypes.shape({ top: PropTypes.number, left: PropTypes.number }),
  onClose: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onTitleUpdate: PropTypes.func,
  onDrop: PropTypes.func, // New prop to handle drop event
};

export default AssetMenu;
