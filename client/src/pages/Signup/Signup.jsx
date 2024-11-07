import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../styles.module.css";

const Signup = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
  });
  const { email, password, username } = inputValue;

  // For error handling
  const [error, setError] = useState(""); // Declare setError for handling error messages

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  // Function for handling errors (using react-toastify)
  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });

  // Function for success messages (using react-toastify)
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-right",
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/signup", // Correct URL for your signup route
        {
          username: username,
          password: password,
          email: email, // Send email along with username and password
        }
      );

      console.log("User signed up:", response.data);
      // Handle success (e.g., redirect to login or show success message)
      handleSuccess("Signup successful!"); // Assuming handleSuccess displays a success message
    } catch (error) {
      console.error("Error during signup:", error.response?.data);
      handleError(
        error.response?.data.message || "Something went wrong during signup."
      );
    }
  };

  return (
    <div>
      <main>
        <div>
          <h2>Signup Account</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                placeholder="Enter your email"
                onChange={handleOnChange}
              />
            </div>
            <div>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                value={username}
                placeholder="Enter your username"
                onChange={handleOnChange}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={handleOnChange}
              />
            </div>
            <button type="submit">Submit</button>
            <span>
              Already have an account? <Link to={"/login"}>Login</Link>
            </span>
          </form>
          <ToastContainer /> {/* This renders the toast notifications */}
          {error && <p style={{ color: "red" }}>{error}</p>}{" "}
          {/* Display error messages */}
        </div>
      </main>
    </div>
  );
};

export default Signup;
