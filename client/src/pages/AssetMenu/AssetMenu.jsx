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
  onDrop,
  provided,
}) {
  const [assetMenuPosition, setAssetMenuPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    console.log("AssetMenu position updated:", assetMenuPosition);
  }, [assetMenuPosition]);

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
    if (onDrop) onDrop(_id, assetMenuPosition);
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
      setCurrentTitle(title);
      setIsEditingTitle(false);
      return;
    }

    setIsEditingTitle(false);
    const previousTitle = title;
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Authorization token is missing.");
      setCurrentTitle(previousTitle);
      return;
    }

    try {
      await axios.put(
        `http://localhost:3001/api/assetMenus/title-update/${_id}`,
        { title: currentTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onTitleUpdate) {
        onTitleUpdate(_id, currentTitle);
      }
    } catch (error) {
      console.error(
        "Error updating the title:",
        error.response ? error.response.data : error
      );
      setCurrentTitle(previousTitle);
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
        position: "absolute",
        zIndex: 1000,
      }}
      ref={provided ? provided.innerRef : undefined}
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
            assets.map((asset) => (
              <li key={asset._id} className="asset-item">
                {asset.name}
              </li>
            ))
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
  provided: PropTypes.object,
};

export default AssetMenu;
