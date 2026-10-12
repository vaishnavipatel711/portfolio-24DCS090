const jwt = require('jsonwebtoken');

// Verifies the JWT sent as:  Authorization: Bearer <token>
// On success it sets req.user = { id, iat, exp } and calls next().
module.exports = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ error: 'Authentication required. Send header "Authorization: Bearer <token>"' });
  }

  // jwt.verify THROWS on a bad/expired token, so it must be inside try/catch,
  // otherwise one bad request could crash the server.
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Token expired. Please log in again.' : 'Invalid token';
    res.status(401).json({ error: message });
  }
};
