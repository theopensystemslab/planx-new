import getServer from "./server";

// commonJS restricts us from using top-level await, so we wrap entire server in a promise
getServer().then((server) => {
  const PORT = process.env.PORT || 8001;

  server.listen(PORT);

  console.info(`api listening http://localhost:${PORT}`);
});
