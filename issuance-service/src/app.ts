import express from "express";
import issuanceRoutes from "./routes/issue.route.js";
import internalRoutes from "./routes/internal.route.js";

const app = express();

app.use(express.json());

// routes
app.use("/api/services/issuance", issuanceRoutes);
app.use("/api/services/issuance/internal", internalRoutes);

export default app;
