const { AuthenticationError, ApolloError } = require("@apollo/server/express4");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User, Game, AssetMenu, Asset } = require("../models");

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "fallback_secret";

const signToken = (user) => {
  const payload = {
    data: {
      id: user._id,
      email: user.email,
      username: user.username,
    },
  };

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
    console.log("Token generated:", token);  // Log the token to verify it's generated
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new ApolloError("Error generating token.");
  }
};

const resolvers = {
  User: {
    id: (parent) => parent._id.toString(),
    createdGames: async (user) => {
      const games = await Game.find({ user: user._id });
      return games.map((game) => ({
        ...game.toObject(),
        _id: game._id.toString(),
      }));
    },
  },
  Game: {
    id: (parent) => parent._id.toString(),  // Ensure _id is cast to string
    assetMenus: async (game) => {
      const assetMenus = await AssetMenu.find({ gameId: game._id });
      return assetMenus.map((assetMenu) => ({
        ...assetMenu.toObject(),
        id: assetMenu._id.toString(),  // Ensure _id is cast to string
      }));
    },
  },  
  AssetMenu: {
    id: (parent) => parent._id.toString(),
  },
  Query: {
    getGames: async (_, __, context) => {
      console.log("Context:", context); // Debugging line
      const { Game } = context.models;
      if (!Game) {
        throw new ApolloError("Game model is not defined in context.");
      }
      const games = await Game.find();
      return games;
    },

    getAssetMenus: async (_, { gameId }) => {
      const assetMenus = await AssetMenu.find({ gameId }).populate("gameId");
      return assetMenus.map((assetMenu) => ({
        ...assetMenu.toObject(),
        id: assetMenu._id.toString(),
      }));
    },

    users: async () => {
      const users = await User.find();
      return users.map((user) => ({
        ...user.toObject(),
        id: user._id.toString(),
      }));
    },

    getUser: async (_, { _id }, { User }) => {
      return await User.findById(_id);  // Use _id instead of id
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);  // Generate token after successful signup
        return { token, user };  // Return both the token and user
      } catch (error) {
        console.error("Error adding user:", error);
        throw new ApolloError("Failed to add user");
      }
    },

    login: async (parent, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError("User not found");
        }

        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new AuthenticationError("Incorrect password");
        }

        const token = signToken(user);  // Generate token after successful login
        return { token, user };  // Return both the token and user
      } catch (error) {
        console.error("Error logging in:", error);
        throw new ApolloError("Login failed");
      }
    },

    createGame: async (_, { _id, input }) => {
      // Check if the _id is valid ObjectId string, else let MongoDB handle it
      const isValidObjectId = mongoose.Types.ObjectId.isValid(_id);
      const game = new Game({
        _id: isValidObjectId ? mongoose.Types.ObjectId(_id) : undefined,  // Only use _id if it's valid
        ...input,  // Include all fields from the input (e.g., title, description)
      });
      
      const savedGame = await game.save();
      
      return {
        ...savedGame.toObject(),
        id: savedGame._id.toString(),  // Return the saved _id as a string if needed
      };
    },           

    updateGame: async (_, { _id, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to update a game.");
      }

      const game = await Game.findOne({ _id, user: context.user.id });
      if (!game) {
        throw new ApolloError("Game not found or you do not have permission to update it.", "FORBIDDEN");
      }

      const updatedGame = await Game.findByIdAndUpdate(_id, input, { new: true });
      return {
        ...updatedGame.toObject(),
        _id: updatedGame._id.toString(),
      };
    },

    deleteGame: async (parent, { _id }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Unauthorized");
      }
      const game = await Game.findByIdAndDelete(_id);
      if (!game) {
        throw new ApolloError("Game not found", "NOT_FOUND");
      }
      return {
        ...game.toObject(),
        id: game._id.toString(),  // Cast _id to string
      };
    },    

    createAssetMenu: async (_, { gameId, input }, context) => {
      const { Game, AssetMenu } = context.models;

      if (!Game || !AssetMenu) {
        throw new ApolloError("Game or AssetMenu model not found in context.");
      }

      if (!mongoose.Types.ObjectId.isValid(gameId)) {
        throw new ApolloError("Invalid gameId format.");
      }

      try {
        const game = await Game.findById(mongoose.Types.ObjectId(gameId));
        if (!game) {
          throw new ApolloError("Game not found");
        }

        const assetMenu = new AssetMenu({
          gameId,
          title: input.title,
          position: input.position,
          assets: input.assets,
        });

        await assetMenu.save();
        return assetMenu;
      } catch (error) {
        console.error("Error creating asset menu:", error);
        throw new ApolloError("Failed to create asset menu");
      }
    },

    deleteAssetMenu: async (_, { _id }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Unauthorized");
      }
      const assetMenu = await AssetMenu.findByIdAndDelete(_id);  // Correct use of _id
      if (!assetMenu) {
        throw new ApolloError("AssetMenu not found", "NOT_FOUND");
      }
      return assetMenu;
    },
  },
};

module.exports = resolvers;
