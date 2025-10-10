import app from "./app.js";
import "dotenv/config";
import { connectDB } from "./utils/connection.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
} catch (error) {
  console.error(`Error while connecting to DB: ${error}`);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Issuance service running on port ${PORT}!`);
});
