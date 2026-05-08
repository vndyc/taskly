// src/routes/+layout.server.js
// Reicht den eingeloggten User an alle Seiten und Layouts weiter.
// locals.user wird in hooks.server.js gesetzt.

export function load({ locals }) {
  return {
    user: locals.user
  };
}
