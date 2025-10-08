import express from "express";
import "dotenv/config";
import { connectDB } from "./utils/connection.js";
import issuanceRoutes from "./routes/issue.route.js";
import internalRoutes from "./routes/internal.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// routes
app.use("/api/services/issuance", issuanceRoutes);
app.use("/api/services/issuance/internal", internalRoutes);

try {
  await connectDB();
} catch (error) {
  console.error(`Error while connecting to DB: ${error}`);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Issuance service running on port ${PORT}!`);
});
