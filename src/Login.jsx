import React from "react";

function Login({ onLogin }) {
  const handleLogin = (event) => {
    event.preventDefault();
    console.log("Login submitted!");
    onLogin(); // Notify parent component to toggle login state
  };

  return (
    <div id="login-container">
      <h2>Login</h2>
      <form id="login-form" onSubmit={handleLogin}>
        <input type="text" id="username" placeholder="Username" required />
        <input type="password" id="password" placeholder="Password" required />
        <div className="auth-buttons">
          <button id="auth-button" className="button-auth" type="submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
