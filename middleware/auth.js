const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({
      errors: 1,
      message: `No token, Unauthorized user`,
      success: false
    });

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;

    next();
  } catch (error) {
    res.status(401).json({
      errors: 1,
      message: `Invalid token`,
      success: false
    });
  }
};
