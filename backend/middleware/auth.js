const jwt = require("jsonwebtoken");

// This function runs before any route it's attached to.
// It checks for a valid token in the request's Authorization header.
// If valid, it lets the request continue (calls next()).
// If missing or invalid, it stops the request with a 401 error.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1]; // pull out just the token part

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // attach the decoded info to the request, in case a route needs it
    next(); // token is valid — proceed to the actual route
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
}

module.exports = requireAuth;
