import { redirect } from "@tanstack/react-router";

/**
 * Do not allow access to /app routes on custom subdomains
 */
export const validateDomain = () => {
  const allowedPatterns = [
    /^editor\.planx\.dev$/,
    /^editor\.planx\.uk$/,
    /^(\d{4,5}\.)?editor\.planx\.pizza$/,
    /^localhost:3000$/,
  ];

  const currentHost = window.location.host;

  const isAllowed = allowedPatterns.some((pattern) =>
    pattern.test(currentHost),
  );

  if (!isAllowed) {
    throw redirect({ to: "/login" });
  }
};
