import Cookies from "js-cookie";

// XXX: leading . is important here, it allows us to set cookie
//      that can be used across other subdomains. For example,
//      .planx.uk cookie will work with planx.uk AND editor.planx.uk
const defaultCookieSettings = {
  path: "/",
  domain: `.${window.location.hostname}`,
};

export const getCookie = (key: string): string | null =>
  Cookies.get(key, defaultCookieSettings) ?? Cookies.get(key);

export const setCookie = (key: string, value: any): string | null =>
  Cookies.set(key, value, defaultCookieSettings);
