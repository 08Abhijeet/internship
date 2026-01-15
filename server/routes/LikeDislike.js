import express from "express";
import { likeComment, dislikeComment } from "../controllers/comment.js";

const router = express.Router();

router.patch("/like/:id", likeComment);
router.patch("/dislike/:id", dislikeComment);

export default router;