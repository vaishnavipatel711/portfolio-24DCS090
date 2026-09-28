module.exports = (req, res, next) => {
  if (["POST", "PUT"].includes(req.method) && !req.is("application/json")) {
    return res.status(415).json({ error: "Content-Type must be application/json" });
  }
  next();
};
