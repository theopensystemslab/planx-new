module.exports = function override(config) {
  // Optional: Disable type-checking and rely on the IDE's tsserver instead
  if (import.meta.env.DISABLE_TYPE_CHECKING) {
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== "ForkTsCheckerWebpackPlugin"
    );
  }
  config.resolve.fallback = {
    crypto: false,
    stream: require.resolve("stream-browserify"),
  };
  return config;
};
