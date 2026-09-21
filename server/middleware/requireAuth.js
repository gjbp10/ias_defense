// Blocks any request that doesn't have a valid, server-side session.
// This is the piece that was completely missing before the refactor --
// every /api route below now opts into this explicitly.
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
}
