// Run this once to generate a hashed version of your chosen admin password.
// Usage (in the backend folder): node generate-password-hash.js YourChosenPassword

const bcrypt = require("bcryptjs");

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.log("Please provide a password. Example:");
  console.log("  node generate-password-hash.js MySecurePassword123");
  process.exit(1);
}

const hash = bcrypt.hashSync(plainPassword, 10);
console.log("\nYour hashed password (copy this into .env as ADMIN_PASSWORD_HASH):\n");
console.log(hash);
console.log("");
