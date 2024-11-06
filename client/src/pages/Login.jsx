import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";
import AuthService from "../utils/auth";

const LoginPage = () => {
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);
  const navigate = useNavigate();

  // Handling form state changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Form submission logic
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formState;

    // Ensure both email and password are provided
    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    try {
      // Call loginUser mutation with variables
      const { data } = await loginUser({
        variables: { email, password },
      });

      // Ensure we have a valid token in the response
      const { token, user } = data.login;

      if (token) {
        // Store the token using AuthService
        AuthService.login(token);
        navigate("/Landing"); // Redirect to the dashboard
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed: " + (error.message || "An unknown error occurred"));
    }
  };

  return (
    <div>
      <main>
        <h2>
          Don't have an account? <Link to="/signup">Sign Up!</Link>
        </h2>
        <h1>Login</h1>
        {error && (
          <p style={{ color: "red" }}>
            Login failed: {error.message || "An unknown error occurred"}
          </p>
        )}
        {/* Login Form */}
        <div>
          <form onSubmit={handleFormSubmit}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your Email"
              value={formState.email}
              onChange={handleChange}
              disabled={loading} // Disable input while loading
            />
            <br />
            <br />
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Your Password"
              value={formState.password}
              onChange={handleChange}
              disabled={loading} // Disable input while loading
            />
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
