import type { Request, Response } from "express";
import type { ResponseMessage } from "../types.js";
import CredentialSchema from "../models/credential.schema.js";

export async function checkCredential(
  req: Request,
  res: Response<ResponseMessage>
) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: "Please enter a username and password to verify your credential",
      error: true,
    });
  }
  try {
    const credential = await CredentialSchema.findOne({
      username,
      password,
    });

    if (!credential) {
      return res.status(404).json({
        message:
          "Invalid username or password. Requested credential not found.",
        error: true,
      });
    }

    res.status(200).json({
      message: "Credential found",
      error: false,
      data: {
        credential: {
          id: credential._id,
          username: credential.username,
          password: credential.password,
          worker: credential.worker,
          issuedAt: credential.createdAt,
        },
      },
    });
  } catch (error) {
    console.error(`Error while checking credential: ${error}`);
    res.status(500).json({
      message:
        "Something went wrong while checking your credential. Please try again.",
      error: true,
    });
  }
}
