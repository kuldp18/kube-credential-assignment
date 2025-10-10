import app from "./app.js";
import "dotenv/config";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Verification service listening at port ${PORT}!`);
});
