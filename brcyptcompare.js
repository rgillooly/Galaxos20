const bcrypt = require("bcrypt");

const plaintextPassword = "Filmlover17";
const storedHash =
  "$2b$12$FDX7frbXVSzeT6C8RRiRZuE5dpWIgC7QrtNYkcEwDZGkVqeLgxTPq"; // Example bcrypt hash

bcrypt.compare(plaintextPassword, storedHash, function (err, isMatch) {
  if (err) {
    console.error("Error comparing passwords:", err);
  } else {
    console.log("Password match result:", isMatch); // Will return true or false
  }
});
