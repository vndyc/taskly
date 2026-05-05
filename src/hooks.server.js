/* ============================================================
   Taskly — Server-Hooks
   ============================================================
   Wird bei jedem Request ausgeführt:
   1. Session aus dem Cookie lesen und User in event.locals.user ablegen
   2. Nicht-öffentliche Routen vor unangemeldetem Zugriff schützen
   ============================================================ */

import { redirect } from '@sveltejs/kit';
import { userAusSession } from '$lib/server/auth.js';

// Seiten, die ohne Login erreichbar sind.
const oeffentlicheRouten = ['/login', '/register'];

// API-Endpoints, die ohne Login erreichbar sein müssen
// (sonst könnte sich niemand einloggen oder registrieren).
const oeffentlicheApiRouten = ['/api/auth/login', '/api/auth/register'];

export async function handle({ event, resolve }) {
  // --- Session laden und User in locals ablegen ---
  const sessionId = event.cookies.get('session');
  const user = await userAusSession(sessionId);
  event.locals.user = user;

  const pfad = event.url.pathname;
  const istOeffentlich =
    oeffentlicheRouten.includes(pfad) || oeffentlicheApiRouten.includes(pfad);

  // --- Schutz: Nicht angemeldete User auf nicht-öffentlichen Routen ---
  if (!user && !istOeffentlich) {
    if (pfad.startsWith('/api/')) {
      return new Response(JSON.stringify({ fehler: 'Nicht angemeldet' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }
    throw redirect(303, '/login');
  }

  // --- Eingeloggte User von Login/Register direkt aufs Dashboard schicken ---
  if (user && oeffentlicheRouten.includes(pfad)) {
    throw redirect(303, '/');
  }

  return resolve(event);
}
