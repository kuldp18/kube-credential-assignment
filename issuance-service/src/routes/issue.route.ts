import { Router } from "express";
import { fetchCredentials } from "../controllers/issue.controller.js";
const router = Router();

router.post("/issue", fetchCredentials);

export default router;
