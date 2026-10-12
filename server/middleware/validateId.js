// Task IDs are MongoDB ObjectIds: exactly 24 hexadecimal characters.
//
// mongoose.isValidObjectId() is more lenient (it also accepts any 12-character
// string), which would let different-looking IDs reach the cache and the database.
// A strict check keeps every cache key tied to exactly one real ID format.
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

module.exports = (req, res, next) => {
  if (!OBJECT_ID.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid task ID format' });
  }
  next();
};