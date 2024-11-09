import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const MovableWindow = ({ children, title, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const dragStart = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);

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
      <header
        className="movable-window-header"
        onMouseDown={handleMouseDown}
        style={{
          cursor: "move",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px",
          backgroundColor: "#ddd",
          borderBottom: "1px solid #aaa",
        }}
      >
        <span>{title}</span>
        {onClose && <button onClick={onClose}>Close</button>}
      </header>

      <div className="movable-window-content">{children}</div>
    </div>
  );
};

MovableWindow.propTypes = {
  onClose: PropTypes.func, // Made onClose optional
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default MovableWindow;
