export const REDIRECT_KEY = "planx_redirect_after_login";

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
