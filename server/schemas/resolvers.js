
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');  // Correct path based on your project structure

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
    id: (parent) => parent._id.toString(),
    
    assetMenus: async (game) => {
      const assetMenus = await AssetMenu.find({ gameId: game._id });
      return assetMenus.map((assetMenu) => ({
        ...assetMenu.toObject(),
        id: assetMenu._id.toString(),
      }));
    },
  
    user: async (game) => {
      // Check if game has a valid user reference
      if (!game.user) {
        return null; // No user associated, return null
      }
  
      try {
        const user = await User.findById(game.user); // Assuming "game.user" is a reference to the User model
        return user || null; // If user is not found, return null
      } catch (error) {
        console.error("Error fetching user:", error); // Log the error for debugging
        return null; // Return null in case of error
      }
    },
  },  

  AssetMenu: {
    id: (parent) => parent._id.toString(),
  },

  Query: {
    getGames: async (parent, args, context) => {
      const { user } = context;  // Access user from context
      
      if (!user) {
        throw new AuthenticationError('You must be logged in to access games');  // Return error if no user
      }
    
      // Fetch the games associated with the logged-in user
      const games = await Game.find({ user: user._id });
      return games;
    },  

    getUserFromToken: async (parent, args, context) => {
      const token = context.headers.authorization || '';  
      if (!token) {
        throw new AuthenticationError('You must be logged in to access user info');
      }

      try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        const userId = decoded.userId;
        const user = await User.findById(userId); // Adjust based on your model
        return user;
      } catch (err) {
        throw new AuthenticationError('Invalid or expired token');
      }
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
      return await User.findById(_id);
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      } catch (error) {
        console.error("Error adding user:", error);
      }
    },

    login: async (_, { email, password }) => {
      console.log('Attempting login with email:', email);
    
      const user = await User.findOne({ email });
    
      if (!user) {
        console.log('User not found');
        throw new AuthenticationError("User not found");
      }
    
      const validPassword = await bcrypt.compare(password, user.password);
    
      if (!validPassword) {
        console.log('Invalid credentials');
        throw new AuthenticationError("Invalid credentials");
      }
    
      console.log('User authenticated successfully');
    
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
    
      return {
        token,
        user,
      };
    },    

    createGame: async (_, { _id, input }) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(_id);
      const game = new Game({
        _id: isValidObjectId ? mongoose.Types.ObjectId(_id) : undefined,
        ...input,
      });

      const savedGame = await game.save();

      return {
        ...savedGame.toObject(),
        id: savedGame._id.toString(),
      };
    },

    updateGame: async (_, { _id, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to update a game.");
      }

      const game = await Game.findOne({ _id, user: context.user.id });
      if (!game) {
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
        id: game._id.toString(),
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
      const assetMenu = await AssetMenu.findByIdAndDelete(_id);
      if (!assetMenu) {
        throw new ApolloError("AssetMenu not found", "NOT_FOUND");
      }
      return assetMenu;
    },
  },
};

module.exports = resolvers;
