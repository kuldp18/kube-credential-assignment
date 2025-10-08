import { Router } from "express";
import { checkCredential } from "../controllers/internal.controller.js";
const router = Router();

router.post("/check", checkCredential);

export default router;
