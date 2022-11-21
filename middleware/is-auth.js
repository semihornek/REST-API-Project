const jwt = require("jsonwebtoken");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, "somesupersupersecret");
    if (!decodedToken) {
      const error = new Error("Not authenticated");
      error.statusCode = 401;
      throw error;
    }
    req.userId = decodedToken.userId;
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
  next();
};
