// Server-side role gate. This is the actual fix for the broken-access-control
// issue found in the security review: the registrar portal used to be gated
// only by client-side React state (`portalMode`), which meant any logged-in
// user -- including a brand-new self-registered account -- could flip a
// toggle in the browser and reach admin screens. Every registrar-only route
// now requires this middleware in addition to requireAuth; the client-side
// toggle in App.jsx is UI convenience only and is never trusted on its own.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }
    next();
  };
}
