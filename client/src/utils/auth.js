import jwt from "jwt-decode";

class AuthService {
  // Decode and return the user's profile from the token
  static getProfile() {
    const token = localStorage.getItem("token"); // Consistent key usage
    if (token) {
      try {
        return jwt(token); // Decode the token to get user data
      } catch (error) {
        console.error("Error decoding token:", error);
        return null; // Return null if decoding fails
      }
    }
    return null; // Return null if no token exists
  }

  // Check if the user is logged in (i.e., if a valid token exists)
  static loggedIn() {
    return typeof window !== "undefined" && !!localStorage.getItem("token"); // Consistent key usage
  }

  // Get the current stored token
  static getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null; // Consistent key usage
  }

  // Logout the user by removing the token from localStorage
  static logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token"); // Consistent key usage
    }
  }

  // Login the user by storing the token in localStorage
  static login(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token); // Consistent key usage
    }
  }
}

export default AuthService;
