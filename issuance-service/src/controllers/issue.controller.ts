import type { Request, Response } from "express";
import type { Credential, ResponseMessage } from "../types.ts";

import {
  checkExistingCredential,
  generateCredential,
} from "../utils/credentials.js";
import CredentialSchema from "../models/credential.model.js";

import { type Document } from "mongoose";

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

  try {
    const existingCredential = (await checkExistingCredential(
      username
    )) as Credential & Document;

    if (existingCredential) {
      return res.status(409).json({
        message: `Credential with username '${username}' already exists`,
        error: false,
        data: {
          credential: {
            id: existingCredential._id,
            username: existingCredential.username,
            password: existingCredential.password,
            issuedBy: `credential issued by ${existingCredential.worker}`,
            issuedAt: existingCredential.createdAt,
          },
        },
      });
    }

    const credentials = generateCredential(username);

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
