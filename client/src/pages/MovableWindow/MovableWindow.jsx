import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const MovableWindow = ({ children, title, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Initial position
  const dragStart = useRef({ x: 0, y: 0 }); // To track the starting mouse position
  const windowRef = useRef(null); // Reference to the window div

  // Mouse events to handle the drag logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      };

      // Prevent dragging the window out of the viewport
      const maxX = window.innerWidth - windowRef.current.offsetWidth;
      const maxY = window.innerHeight - windowRef.current.offsetHeight;
      const clampedX = Math.max(0, Math.min(newPosition.x, maxX));
      const clampedY = Math.max(0, Math.min(newPosition.y, maxY));

      setPosition({ x: clampedX, y: clampedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Adding mouse event listeners to handle drag globally
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mouseleave", handleMouseLeave);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseLeave);
    }

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDragging]);

  return (
    <div
      className="movable-window"
      ref={windowRef}
      style={{
        position: "absolute",
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 1000, // Ensures the window appears above other content
        userSelect: "none", // Prevent text selection while dragging
      }}
      onMouseDown={handleMouseDown} // Starts the drag on mouse down
    >
      <header className="movable-window-header"></header>
      <div className="movable-window-content">{children}</div>
    </div>
  );
};

MovableWindow.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default MovableWindow;
