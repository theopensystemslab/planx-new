module.exports = {
  // extends: "@snowpack/app-scripts-react",
  devOptions: {
    port: 8080,
    src: "src",
    bundle: process.env.NODE_ENV === "production",
    fallback: "public/index.html",
  },
  mount: {
    public: "/",
    src: "/_dist_",
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    "@snowpack/plugin-typescript",
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
  proxy: {
    /* ... */
  },
  alias: {
    src: "./src",
  },
};
