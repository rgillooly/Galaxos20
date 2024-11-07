const typeDefs = `
type User {
  id: ID!
  username: String!
  email: String!
  password: String!
  createdGames: [Game]
}

type Game {
  id: ID!
  name: String!
  description: String!
  user: User
  assetMenus: [AssetMenu]
}


# Define Position as a separate output type for queries
type Position {
  top: Float
  left: Float
}

# Define PositionInput as an input type for mutations
input PositionInput {
  top: Float
  left: Float
}

# Define the AssetMenu type
type AssetMenu {
  id: ID!
  title: String!
  position: Position  # Changed to Position (output type)
  assets: [Asset]
}

input GameInput {
  name: String
  description: String
}

input AssetMenuInput {
  title: String!
  position: PositionInput  # Still using PositionInput here for mutations
}

type Asset {
  id: ID!
  name: String!
  url: String!
}

type Auth {
  token: ID!
  user: User
}

type Query {
getUserFromToken: User
  users: [User]
  getGames: [Game]
  game(_id: ID!): Game
  getAssetMenus: [AssetMenu]
  getUser(_id: ID!): User  # Corrected to return a single user by ID
  user(username: String, email: String): User  # Allows querying by username or email
  me: User
}

type Mutation {
  addUser(username: String!, email: String!, password: String!): Auth  # Corrected mutation
  login(email: String!, password: String!): Auth
  createGame(_id: ID!, input: GameInput!): Game
  updateGame(_id: ID!, input: GameInput!): Game
  deleteGame(_id: ID!): Game
  createAssetMenu(_id: ID!, input: AssetMenuInput!): AssetMenu  # Fixed the typo here
  deleteAssetMenu(_id: ID!): AssetMenu  # Fixed the typo here
}
`;

module.exports = typeDefs;
