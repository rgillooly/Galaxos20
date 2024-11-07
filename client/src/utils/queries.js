import { gql } from "@apollo/client";

// Query to get games for the authenticated user
export const GET_GAMES = gql`
query {
  getGames {
    id
    name
    user {
      id
      username
      email
    }
  }
}
`;

export const CREATE_GAME = gql`
  mutation createGame($input: GameInput!) {
    createGame(input: $input) {
      id
      name
      description
      user {
        id # Optionally get the user's ID
        username # Assuming you have a username field
      }
      assetMenus {
        id
        name
      }
    }
  }
`;

// Query to get user by username
export const QUERY_USER = gql`
  query user($username: String!) {
    user(username: $username) {
      id
      username
      email
      mealsByDay {
        dayNumber
        carbGoal
        proteinGoal
        fatsGoal
        calorieGoal
        savedMeals {
          mealName
          calories
          carbs
          protein
          fats
          completed
        }
      }
    }
  }
`;

// Query to get all days (assuming you want to retrieve days)
export const GET_DAYS = gql`
  query GetDays {
    days {
      id
      name
      meals {
        id
        mealName
        calories
        carbs
        protein
        fats
        completed
      }
    }
  }
`;

export const GET_ASSET_MENUS = gql`
  query GetAssetMenus {
    getAssetMenus {
      id
      gameId
      title
      position {
        top
        left
      }
      assets {
        id
        type
        url
      }
    }
  }
`;
