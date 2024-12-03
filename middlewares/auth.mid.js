const { verify } = require("jsonwebtoken");
const { HTTP_UNAUTHORIZED } = require("../constants/http_status");

module.exports = (req, res, next) => {
  const token = req.headers.access_token;

  if (!token) return res.status(HTTP_UNAUTHORIZED).send();
  try {
    const decodedUser = verify(token, process.env.JWT_SECRET);
    req.user = decodedUser;
  } catch (error) {
    res.status(HTTP_UNAUTHORIZED).send();
  }
  return next();
};