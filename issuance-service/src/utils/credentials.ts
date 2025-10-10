import CredentialSchema from "../models/credential.model.js";
import type { Credential } from "../types.ts";
import crypto from "crypto";

export function generateCredential(username: string): Credential {
  return {
    username,
    password: crypto.randomBytes(16).toString("base64").slice(0, 16),
    worker: process.env.WORKER_NAME || "worker-local",
  };
}

export async function checkExistingCredential(
  username: string
): Promise<null | Credential> {
  const cred = await CredentialSchema.findOne({ username });

  if (cred) {
    return cred;
  }
  return null;
}
