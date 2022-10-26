import "./assertEnv";
import express from "express";
import initRoutes from "./init";
import publicRoutes from "./public";
import authRoutes from "./auth";
import payRoutes from "./pay";
import gisRoutes from "./gis";
import flowRoutes from "./flows";
import integrationRoutes from "./integrations";
import webhookRoutes from "./webhooks";
import analyticsRoutes from "./analytics";
import errorHandler from "../error";

const app = express();

app.set("trust proxy", 1);

app.use(initRoutes);
app.use(authRoutes);
app.use(gisRoutes);
app.use(flowRoutes);
app.use(publicRoutes);
app.use(analyticsRoutes);
app.use(webhookRoutes);
app.use(payRoutes);
app.use(integrationRoutes);
app.use(errorHandler);

export default app;
