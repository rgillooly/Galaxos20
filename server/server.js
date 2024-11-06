const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const { User, Game, AssetMenu, Asset } = require('./models'); // Import models

const PORT = process.env.PORT || 3001;
const app = express();

// Define an async function to start the Apollo Server
async function startApolloServer() {
  // Create a new instance of Apollo Server with the GraphQL schema
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return {
        user: req.user,  // Assuming you're attaching the logged-in user here
        models: { Game, AssetMenu, Asset, User }  // Make sure models are passed correctly
      };
    }
  });

  // Apply JSON and URL-encoded middleware before the Apollo middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Start the Apollo Server
  await server.start();

  // Set up the middleware for Apollo Server with Express
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({
      models: { User, Game, AssetMenu, Asset },
      user: req.user || null,
    }),
  }));

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  // Start the DB connection and then start the Express server
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
}

// Call the async function to start the server
startApolloServer();
