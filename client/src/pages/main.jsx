import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import App from "./App"; // Import your Apollo Client setup
import "./index.css";

// Import components for routing
import Signup from "./Signup.jsx";
import LoginPage from "./Login.jsx";
import GameList from "./GameList.jsx";
import Landing from "./Landing.jsx"; // Ensure you import the Landing component

// Create the router
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true, // This specifies that it should match the "/" path
        element: <Landing />,
      },
      {
        path: "Landing", // Matches "/Landing"
        element: <GameList />,
      },
      {
        path: "signup", // Matches "/signup"
        element: <Signup />,
      },
      {
        path: "loginpage", // Matches "/loginpage"
        element: <LoginPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={App}>
    <RouterProvider router={router} />
  </ApolloProvider>
);
