import { Router } from "express";
import { verifyCredential } from "../controllers/verify.controller.js";

const router = Router();

router.post("/verify", verifyCredential);

export default router;
