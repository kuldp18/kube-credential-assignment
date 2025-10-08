import mongoose from "mongoose";
import type { Credential } from "../types.ts";

const credentialSchema = new mongoose.Schema<Credential>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    worker: { type: String, required: true },
  },
  { timestamps: true, collection: "credentials" }
);

const CredentialSchema = mongoose.model<Credential>(
  "Credential",
  credentialSchema
);

export default CredentialSchema;
