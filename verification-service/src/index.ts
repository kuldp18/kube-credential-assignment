import express from "express";
import "dotenv/config";
import verificationRoutes from "./routes/verify.route.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use("/api/services/verification", verificationRoutes);

app.listen(PORT, () => {
  console.log(`Verification service listening at port ${PORT}!`);
});
