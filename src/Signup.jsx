import React, { useRef } from "react";

function Signup({ onClose }) {
  const signupWindowRef = useRef(null);

  const handleSignup = (event) => {
    event.preventDefault();
    console.log("Signup submitted!");
    onClose(); // Close the signup window after submission
  };

  const dragElement = (event) => {
    event.preventDefault();
    let pos1 = 0, pos2 = 0, pos3 = event.clientX, pos4 = event.clientY;
    const element = signupWindowRef.current;

    const onMouseMove = (e) => {
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = `${element.offsetTop - pos2}px`;
      element.style.left = `${element.offsetLeft - pos1}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div id="window-signup" ref={signupWindowRef} className="signup-window">
      <div className="header" onMouseDown={dragElement}>
        <span>Sign Up</span>
        <button className="closewindow" onClick={onClose}>
          X
        </button>
      </div>
      <form id="signup-form" onSubmit={handleSignup}>
        <label htmlFor="signup-username">Username:</label>
        <input type="text" id="signup-username" required />
        <br />
        <label htmlFor="signup-password">Password:</label>
        <input type="password" id="signup-password" required />
        <br />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
