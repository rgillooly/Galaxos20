import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./AssetMenu.css";

function AssetMenu({
  _id,
  title,
  assets = [],
  position = { top: 0, left: 0 },
  onClose,
  onDragStart,
  onDragEnd,
  onTitleUpdate,
  onDrop, // Callback to notify parent about the drop
  provided, // For react-beautiful-dnd if necessary
}) {
  const [assetMenuPosition, setAssetMenuPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const dragStart = useRef({ x: 0, y: 0 });

  // Update the local title state if the prop changes
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - assetMenuPosition.left,
      y: e.clientY - assetMenuPosition.top,
    };
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
    if (onDrop) onDrop(_id, assetMenuPosition); // Notify parent of the drop
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTitleChange = (e) => {
    setCurrentTitle(e.target.value);
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!currentTitle.trim()) {
      console.error("Title cannot be empty.");
      setCurrentTitle(title); // Revert to the original title
      setIsEditingTitle(false);
      return;
    }

    setIsEditingTitle(false); // Exit editing mode
    const previousTitle = title; // Save current title for rollback
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Authorization token is missing.");
      setCurrentTitle(previousTitle); // Rollback to the previous title
      return;
    }

    try {
      // Update the backend
      await axios.put(
        `http://localhost:3001/api/assetMenus/title-update/${_id}`,
        { title: currentTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onTitleUpdate) {
        // Notify parent about the title update
        onTitleUpdate(_id, currentTitle);
      }
    } catch (error) {
      console.error(
        "Error updating the title:",
        error.response ? error.response.data : error
      );
      setCurrentTitle(previousTitle); // Revert on failure
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
      style={{
        top: `${assetMenuPosition.top}px`,
        left: `${assetMenuPosition.left}px`,
      }}
      ref={provided ? provided.innerRef : undefined} // Added innerRef for drag functionality
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      <header className="asset-menu-header">
        {isEditingTitle ? (
          <input
            type="text"
            value={currentTitle}
            onChange={handleTitleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="edit-input"
          />
        ) : (
          <h3 onClick={handleEditTitle}>{currentTitle}</h3>
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
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onTitleUpdate: PropTypes.func,
  onDrop: PropTypes.func,
  provided: PropTypes.object, // For drag-and-drop props
};

export default AssetMenu;