import server from "./server.js";

const PORT = process.env.PORT || 8001;

server.listen(PORT);

console.info(`api listening http://localhost:${PORT}`);
