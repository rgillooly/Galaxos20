import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the User Context
const UserContext = createContext();

// Create the Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // Loading state to handle user fetching
  const [error, setError] = useState(null); // Error state to display any errors

  // Fetch user data using the token stored in localStorage
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      // Ensure token is present before making the request
      if (!token) {
        throw new Error("No token found, user is not logged in");
      }

      const response = await axios.get("http://localhost:3001/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is included here
        },
      });

      // Check if response data is structured correctly
      if (response.data && response.data.user) {
        setUser(response.data.user); // Set user data from response
      } else {
        throw new Error("Invalid user data received");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null); // Clear user data on error
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  // Call fetchUser when the component mounts
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, error }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => React.useContext(UserContext);
