import React from "react";
import PropTypes from "prop-types";
import "./Asset.css"; // Optional: Add some styling for your assets

const Asset = ({ type, content, imageUrl }) => {
  // Render image if the type is 'image', otherwise render text
  return (
    <div className="asset">
      {type === "image" ? (
        <img src={imageUrl} alt="Asset" className="asset-image" />
      ) : (
        <div className="asset-text">
          <pre>{content}</pre>
        </div>
      )}
    </div>
  );
};

Asset.propTypes = {
  type: PropTypes.oneOf(["image", "text"]).isRequired, // Asset type, either 'image' or 'text'
  content: PropTypes.string, // Content for text assets
  imageUrl: PropTypes.string, // Image URL for image assets
};

export default Asset;
