import { setCookie } from "lib/cookie";

export const REDIRECT_KEY = "planx_redirect_after_login";

/**
 * On local and Pizza environments the JWT comes back from OAuth as a `?jwt`
 * search param (cross-domain cookie restrictions as we auth via planx.dev)
 *
 * On staging/production the API sets the cookie via response headers instead
 *
 * We persist this param to a cookie and report whether one was present, so the
 * route guard can strip it with a router-native `redirect`
 */
export function persistJwtFromUrl(searchStr: string): boolean {
  const jwt = new URLSearchParams(searchStr).get("jwt");
  if (!jwt) return false;

  setCookie("jwt", jwt);
  setCookie("auth", JSON.stringify({ loggedIn: true }));
  return true;
}

// Ensures the path is a relative path by resolving it against the current origin
// if path is absolute e.g. "https://evil.com", URL() will adopt that, and return false
export function isSecureLocalRedirect(path: string | null): boolean {
  if (!path) return false;
  try {
    const url = new URL(path, window.location.origin);
    return url.origin === window.location.origin && !path.startsWith("//");
  } catch {
    return false;
  }
}
