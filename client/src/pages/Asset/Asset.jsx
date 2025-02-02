import React, { useState } from "react";
import { useDrag } from "react-dnd";

const Asset = ({ asset, onMove }) => {
  const [position, setPosition] = useState({ top: asset.y, left: asset.x });

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ASSET",
    item: { ...asset, x: position.left, y: position.top },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleDrop = (newPosition) => {
    setPosition(newPosition);
    if (onMove) {
      onMove({ ...asset, x: newPosition.left, y: newPosition.top });
    }
  };

  return (
    <div
      ref={drag}
      className="asset"
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
      onDrop={(e) => handleDrop(e)}
    >
      {asset.name}
    </div>
  );
};

export default Asset;
