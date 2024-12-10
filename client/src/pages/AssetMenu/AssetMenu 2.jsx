import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./AssetMenu.css";

function AssetMenu({
  _id,
  title,
  assets = [],
  position = { top: 0, left: 0 },
  onClose,
  onTitleUpdate,
  onDrop,
}) {
  const [assetMenuPosition, setAssetMenuPosition] = useState(position);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const gameContainerRef = useRef(null); // Reference to the game container

  // When the title changes, update the state
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setAssetMenuPosition(position); // Update position on prop change
  }, [position]);

  // Calculate the position relative to the game container
  const calculatePositionRelativeToGameContainer = (e) => {
    if (gameContainerRef.current) {
      const gameContainerRect =
        gameContainerRef.current.getBoundingClientRect();
      return {
        top: e.clientY - gameContainerRect.top,
        left: e.clientX - gameContainerRect.left,
      };
    }
    return { top: 0, left: 0 }; // Default if gameContainerRef is not yet available
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only allow left mouse button (button 0)

    e.preventDefault(); // Prevent any default action like text selection

    setIsEditingTitle(false);

    // Calculate initial position for drag
    dragStart.current = {
      x: e.clientX - assetMenuPosition.left,
      y: e.clientY - assetMenuPosition.top,
    };

    setDragging(true); // Start dragging

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const newPos = calculatePositionRelativeToGameContainer(e);
    setAssetMenuPosition({
      top: newPos.top - dragStart.current.y,
      left: newPos.left - dragStart.current.x,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);

    // Remove event listeners
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (onDrop) {
      onDrop(_id, assetMenuPosition);
    }
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
    if (e.key === "Escape") setCurrentTitle(title);
  };

  return (
    <div
      className="asset-menu"
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        top: `${assetMenuPosition.top}px`,
        left: `${assetMenuPosition.left}px`,
        cursor: dragging ? "grabbing" : "move",
        zIndex: 10,
      }}
      ref={gameContainerRef} // Ensure the menu is within the game container's context
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
  }),
  onClose: PropTypes.func,
  onTitleUpdate: PropTypes.func,
  onDrop: PropTypes.func,
};

export default AssetMenu;
