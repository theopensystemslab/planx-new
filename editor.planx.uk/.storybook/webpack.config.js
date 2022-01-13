const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = function ({ config }) {
  config.module.rules.push({
    test: /\.scss$/,
    use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
    include: path.resolve(__dirname, "../"),
  });

  config.plugins.push(new MiniCssExtractPlugin({ filename: "[name].css" }));

  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    crypto: false,
    stream: require.resolve("stream-browserify"),
  };

  return config;
};
