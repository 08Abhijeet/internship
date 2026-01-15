import express from "express";
import { translateComment } from "../controllers/comment.js";
const router = express.Router();

router.post("/translate", translateComment);

export default router;  