import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./MovableWindow.css";

const MovableWindow = ({ children, title, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const windowRef = useRef(null);
  const contentRef = useRef(null); // Ref to observe content size changes
  const dragStart = useRef({ x: 0, y: 0 });

  // Mouse down event for initiating dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // Mouse move event for updating the position while dragging
  const handleMouseMove = (e) => {
    if (isDragging) {
      requestAnimationFrame(() => {
        const newPosition = {
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        };

        const maxX = window.innerWidth - windowRef.current.offsetWidth;
        const maxY = window.innerHeight - windowRef.current.offsetHeight;
        const clampedX = Math.max(0, Math.min(newPosition.x, maxX));
        const clampedY = Math.max(0, Math.min(newPosition.y, maxY));

        setPosition({ x: clampedX, y: clampedY });
      });
    }
  };

  // Mouse up event to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Adding mouse event listeners for dragging the window
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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
        zIndex: 1000,
        userSelect: "none",
      }}
    >
      <header className="movable-window-header" onMouseDown={handleMouseDown}>
        {title && <span>{title}</span>}
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none" }}>
            X
          </button>
        )}
      </header>

      <div className="movable-window-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

MovableWindow.propTypes = {
  onClose: PropTypes.func, // Optional onClose function
  title: PropTypes.string, // Optional title
  children: PropTypes.node.isRequired, // Content to be rendered inside
};

export default MovableWindow;
