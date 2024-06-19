const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    roles: user.roles.map(role => role.name),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

module.exports = {
  generateAccessToken,
};
