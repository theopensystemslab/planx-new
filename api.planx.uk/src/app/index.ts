import express from "express";
import init from "./init";
import publicRoutes from "./public";
import authenticated from "./authenticated";
import errorHandler from "./error";

const app = express();

app.set("trust proxy", 1);

app.use(init);
app.use(publicRoutes);
app.use(authenticated);
app.use(errorHandler);

export default app;
