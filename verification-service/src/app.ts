import express from "express";
import verificationRoutes from "./routes/verify.route.js";

const app = express();

app.use(express.json());
app.use("/api/services/verification", verificationRoutes);

export default app;
