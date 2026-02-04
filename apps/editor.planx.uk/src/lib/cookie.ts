import Cookies from "js-cookie";

// XXX: leading . is important for non-localhost domains here,
//      it allows us to set cookie that can be used across
//      other subdomains. For example, .planx.uk cookie will work
//      with both planx.uk AND editor.planx.uk.
const { hostname } = window.location;
const defaultCookieSettings = {
  path: "/",
  domain: hostname === "localhost" ? hostname : `.${hostname}`,
};

export const getCookie = (key: string): string | null =>
  Cookies.get(key, defaultCookieSettings) ?? Cookies.get(key);

export const setCookie = (key: string, value: string | null): string | null =>
  Cookies.set(key, value, defaultCookieSettings);

export const clearCookie = (key: string): void => {
  Cookies.remove(key, defaultCookieSettings);
  // Also try to remove without domain
  Cookies.remove(key);
};
