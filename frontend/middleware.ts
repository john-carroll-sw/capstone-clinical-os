/**
 * Vercel Edge Middleware — Basic Auth gate for the deployed demo
 *
 * Runs at the edge before any content is served. Visitors see
 * the browser's native username/password dialog. Without valid
 * credentials the HTML/JS bundle never reaches the browser.
 *
 * Configure in Vercel Dashboard → Settings → Environment Variables:
 *   DEMO_USER  = <your username>
 *   DEMO_PASS  = <your password>
 *
 * To disable auth (e.g. for local dev), simply don't set the env vars.
 */

export const config = {
  // Protect all routes. Static assets (.js, .css, .svg, etc.) are also
  // behind auth, but the browser re-sends credentials automatically
  // after the first successful challenge.
  matcher: '/(.*)',
};

export default function middleware(request: Request): Response | undefined {
  const user = process.env.DEMO_USER;
  const pass = process.env.DEMO_PASS;

  // If env vars aren't set, skip auth (local dev / unconfigured)
  if (!user || !pass) {
    return undefined; // pass through
  }

  const auth = request.headers.get('authorization');

  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      try {
        const decoded = atob(encoded);
        const [inputUser, ...passParts] = decoded.split(':');
        const inputPass = passParts.join(':'); // handle passwords containing ':'

        if (inputUser === user && inputPass === pass) {
          return undefined; // authenticated — pass through
        }
      } catch {
        // malformed base64 — fall through to 401
      }
    }
  }

  return new Response('Access denied — enter your demo credentials.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="ClinicalOS Demo", charset="UTF-8"',
    },
  });
}
