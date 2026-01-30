import { createRouter } from "@tanstack/react-router";
import { getCookie, setCookie } from "lib/cookie";

import { routeTree } from "./routeTree.gen";

const hasJWT = (): boolean | void => {
  // This cookie indicates the presence of the secure httpOnly "jwt" cookie
  const authCookie = getCookie("auth");
  if (authCookie) return true;

  // If JWT not set via cookie, check search params
  const jwtSearchParams = new URLSearchParams(window.location.search).get(
    "jwt",
  );
  if (!jwtSearchParams) return false;

  // Remove JWT from URL, and re-run this function
  setCookie("jwt", jwtSearchParams);
  setCookie("auth", JSON.stringify({ loggedIn: true }));
  // Remove the jwt param from the URL
  const url = new URL(window.location.href);
  url.searchParams.delete("jwt");
  window.history.replaceState({}, document.title, url.pathname + url.search);

  // Return true to indicate authenticated state
  return true;
};

export const router = createRouter({
  routeTree,
  context: { currentUser: hasJWT() },
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
