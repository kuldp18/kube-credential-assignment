import type { Request, Response } from "express";
import type { ResponseMessage } from "../types.js";
import "dotenv/config";
import axios from "axios";

export async function verifyCredential(
  req: Request,
  res: Response<ResponseMessage>
) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: "Please provide both username and password to proceed.",
      error: true,
    });
  }

  try {
    const verificationResponse = await axios.post(
      process.env.ISSUANCE_SERVICE_URL as string,
      {
        username,
        password,
      }
    );

    res
      .status(verificationResponse.status)
      .json(verificationResponse.data as ResponseMessage);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log(
          `Received a ${error.response.status} status from issuance service.`
        );

        return res
          .status(error.response.status)
          .json(error.response.data as ResponseMessage);
      }
    }

    console.error(`Error while verifying credential: ${error}`);
    res.status(500).json({
      message: "Something went wrong while verifying your credential",
      error: true,
    });
  }
}
