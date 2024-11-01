import React, { useState } from "react";
import "./MovableWindow.css";

function MovableWindow({ title, children, onClose }) {
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Initial position
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Handle the start of dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle dragging movement
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  // End dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Attach mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div
      className="movable_window"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="header" onMouseDown={handleMouseDown}>
        <span>{title}</span>
        <button className="close-btn" onClick={onClose}>
          X
        </button>
      </div>
      <div className="content">{children}</div>
    </div>
  );
}

export default MovableWindow;
