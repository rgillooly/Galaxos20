import React from "react";
import PropTypes from "prop-types";
import { Droppable } from "react-beautiful-dnd";
import "./SnapGrid.css";

const SnapGrid = ({ id, children, onDrop, rows, columns, cellSize }) => {
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
    if (onDrop) onDrop(id, assetMenuPosition); // Notify parent of the drop
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <Droppable droppableId={`snap-grid-${id}`} type="ASSET">
      {(provided) => (
        <div
          className="snap-grid"
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            width: columns * cellSize,
            height: rows * cellSize,
          }}
        >
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

SnapGrid.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  rows: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
};

export default SnapGrid;
