import mongoose from "mongoose";
import "dotenv/config";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Issuance DB Connected!");
  } catch (error) {
    throw error;
  }
}
