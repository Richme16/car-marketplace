const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// POST /api/auth/login - checks the submitted username/password against
// the values in .env, and returns a signed token if they match.
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check the username matches
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check the password matches the stored hash
    // bcrypt.compare re-hashes the submitted password and checks it against
    // the stored hash — the plain password itself is never stored anywhere.
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Credentials are correct — issue a signed token.
    // This token proves "I logged in successfully" without needing to
    // re-send the password on every future request.
    const token = jwt.sign(
      { username }, // data embedded in the token
      process.env.JWT_SECRET, // the secret key used to sign it
      { expiresIn: "8h" } // token stops working after 8 hours, for safety
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

module.exports = router;
