import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios"; // Make sure to import axios if it's used for API calls
import "./AssetMenu.css";

function AssetMenu({ _id, title, position, assets, onDrop, onTitleUpdate }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [menuPosition, setMenuPosition] = useState(position);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);

  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent text selection while dragging
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = e.clientY - dragStartPos.y;

    setMenuPosition((prevPos) => ({
      top: prevPos.top + deltaY,
      left: prevPos.left + deltaX,
    }));

    // Update the starting point for the next move
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Call onDrop to save the new position
      onDrop(_id, menuPosition);
    }
  };

  useEffect(() => {
    // Add mouse move and mouse up listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Cleanup listeners when component is unmounted
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStartPos]);

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

  return (
    <div
      className="asset-menu"
      style={{
        position: "absolute",
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <header className="asset-menu-header">
        {isEditingTitle ? (
          <input
            type="text"
            value={currentTitle}
            onChange={handleTitleChange}
            onBlur={handleSaveTitle} // Call save on blur
            autoFocus
            className="edit-input"
          />
        ) : (
          <h3 onClick={handleEditTitle}>{currentTitle}</h3>
        )}
        <button onClick={() => console.log("Close menu")}>Close</button>
      </header>
      <div className="asset-menu-content">
        <ul>
          {assets && assets.length > 0 ? (
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
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  assets: PropTypes.array, // Make sure to define assets prop
  onDrop: PropTypes.func.isRequired,
  onTitleUpdate: PropTypes.func.isRequired,
};

export default AssetMenu;
