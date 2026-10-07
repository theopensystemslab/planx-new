export const isLiveEnv = () =>
  ["production", "staging", "pizza"].includes(process.env.NODE_ENV || "");
