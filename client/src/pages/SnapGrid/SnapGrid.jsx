import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./SnapGrid.css";

const SnapGrid = ({ id, children, rows, columns, cellSize }) => {
  const [gridLocked, setGridLocked] = useState(false); // Lock state
  const [gridPosition, setGridPosition] = useState({ x: 0, y: 0 }); // Initial position
  const [isDraggingGrid, setIsDraggingGrid] = useState(false);
  const dragStartPosition = useRef(null);

  // Load saved position and lock state from localStorage when component mounts
  useEffect(() => {
    const savedPosition = JSON.parse(localStorage.getItem("gridPosition"));
    const savedLockState = JSON.parse(localStorage.getItem("gridLocked"));

    if (savedPosition) setGridPosition(savedPosition);
    if (savedLockState !== null) setGridLocked(savedLockState); // Load lock state if available
  }, []);

  // Save position and lock state to localStorage when they change
  useEffect(() => {
    localStorage.setItem("gridPosition", JSON.stringify(gridPosition));
    localStorage.setItem("gridLocked", JSON.stringify(gridLocked));
  }, [gridPosition, gridLocked]);

  const handleGridDragStart = (e) => {
    if (gridLocked) return; // Disable dragging if locked
    setIsDraggingGrid(true);
    dragStartPosition.current = {
      x: e.clientX - gridPosition.x,
      y: e.clientY - gridPosition.y,
    };
  };

  const handleGridDragMove = (e) => {
    if (!isDraggingGrid || !dragStartPosition.current || gridLocked) return;

    const newX = e.clientX - dragStartPosition.current.x;
    const newY = e.clientY - dragStartPosition.current.y;

    setGridPosition({ x: newX, y: newY });
  };

  const handleGridDragEnd = () => {
    if (gridLocked) return; // Skip if locked
    setIsDraggingGrid(false);
    dragStartPosition.current = null;
  };

  const toggleGridLock = () => {
    setGridLocked((prev) => !prev);
  };

  return (
    <div
      className="snap-grid-wrapper"
      style={{
        position: "absolute",
        transform: `translate(${gridPosition.x}px, ${gridPosition.y}px)`,
        width: columns * cellSize,
        height: rows * cellSize,
      }}
      onMouseDown={handleGridDragStart}
      onMouseMove={handleGridDragMove}
      onMouseUp={handleGridDragEnd}
      onMouseLeave={handleGridDragEnd} // Handle drag end if mouse leaves the grid
    >
      {/* Lock/Unlock Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent dragging while clicking the button
          toggleGridLock();
        }}
        className="lock-toggle-btn"
        style={{
          position: "absolute",
          top: -30, // Adjust to position above the grid
          left: 10, // Adjust to align with grid edge
        }}
      >
        {gridLocked ? "Unlock Grid" : "Lock Grid"}
      </button>

      {/* Grid Content */}
      <div
        className="snap-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          width: "100%",
          height: "100%",
          border: "1px solid #ccc",
        }}
      >
        {children}
      </div>
    </div>
  );
};

SnapGrid.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
  rows: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
};

export default SnapGrid;
