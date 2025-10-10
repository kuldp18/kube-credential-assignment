import type { Request, Response } from "express";
import type { Credential, ResponseMessage } from "../types.ts";

import {
  checkExistingCredential,
  generateCredential,
} from "../utils/credentials.js";
import CredentialSchema from "../models/credential.model.js";

export async function fetchCredentials(
  req: Request,
  res: Response<ResponseMessage>
) {
  const { username } = req.body || {};

  if (!username) {
    return res.status(400).json({
      message: `Please provide a username`,
      error: true,
    });
  }

  const existingCredential = await checkExistingCredential(username);

  if (existingCredential) {
    return res.status(200).json({
      message: `Credential with username '${username}' already exists`,
      error: false,
      data: {
        credential: {
          username: existingCredential.username,
          password: existingCredential.password,
          issuedBy: `credential issued by ${existingCredential.worker}`,
          issuedAt: existingCredential.createdAt,
        },
      },
    });
  }

  const credentials = generateCredential(username);

  try {
    const savedCredentials = await CredentialSchema.create<Credential>({
      username: credentials.username,
      password: credentials.password,
      worker: credentials.worker,
    });

    res.status(201).json({
      message: "Credential generated",
      error: false,
      data: {
        credential: {
          id: savedCredentials._id,
          username: savedCredentials.username,
          password: savedCredentials.password,
          issuedBy: `credential issued by ${savedCredentials.worker}`,
          issuedAt: savedCredentials.createdAt,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Something went wrong while saving your credentials. Please try again.",
      error: true,
    });
  }
}
