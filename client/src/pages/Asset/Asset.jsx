import React, { useState } from "react";
import PropTypes from "prop-types";
import "./Asset.css";

function Asset({ asset }) {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: asset.x, y: asset.y });
  const [size, setSize] = useState({
    width: asset.width,
    height: asset.height,
  });

  const handleDragStart = (e) => {
    setDragging(true);
    e.dataTransfer.setData("asset", JSON.stringify(asset)); // Save the asset data
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  const handleResize = (e) => {
    const newWidth = Math.max(50, e.clientX - position.x); // Keep a minimum size
    const newHeight = Math.max(50, e.clientY - position.y); // Keep a minimum size

    setSize({ width: newWidth, height: newHeight });
  };

  return (
    <div
      className="asset"
      draggable={!dragging}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        position: "absolute",
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        border: "1px solid #000",
        backgroundColor: "lightgray",
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      <div
        className="resize-handle"
        onMouseDown={handleResize}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "10px",
          height: "10px",
          backgroundColor: "darkgray",
          cursor: "se-resize",
        }}
      />
    </div>
  );
}

Asset.propTypes = {
  asset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
};

export default Asset;
