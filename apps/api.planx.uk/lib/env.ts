import capitalize from "lodash/capitalize.js";

export const isLiveEnv = () =>
  ["production", "staging", "pizza"].includes(process.env.NODE_ENV || "");

/**
 * Get current environment, formatted for display
 */
export const getFormattedEnvironment = (): string => {
  let environment = process.env.NODE_ENV;
  if (environment === "pizza") {
    const pizzaNumber = new URL(process.env.API_URL_EXT!).href.split(".")[1];
    environment += ` ${pizzaNumber}`;
  }
  // For readability redefine development as local for slack warnings
  if (environment === "development") {
    environment = "local";
  }
  return capitalize(environment);
};
