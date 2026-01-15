import express from "express";
import { 
  postcomment, 
  getallcomment, 
  deletecomment, 
  editcomment, 
} from "../controllers/comment.js";

const router = express.Router();

router.post("/postcomment", postcomment);
router.get("/:videoid", getallcomment);
router.delete("/deletecomment/:id", deletecomment);
router.patch("/editcomment/:id", editcomment);



export default router;