import server from "./server";

const PORT = process.env.PORT || 8001;

server.listen(PORT);

console.info(`api listening http://localhost:${PORT}`);
