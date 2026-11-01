const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWTserect = process.env.JWT_MESSAGE;

const fetchuser = (req, res, next) => {
  const jwtToken = req.header("authToken") || req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!jwtToken) {
    return res.status(401).json({ message: "You do not have authentication token", error: true, status: 401 });
  }
  try {
    const token = jwt.verify(jwtToken, JWTserect);
    req.id = token.id;
    next();
  } catch {
    return res.status(401).json({ message: "LOG-OUT! please login for further approach", error: true, status: 401 });
  }
};

module.exports = fetchuser;
