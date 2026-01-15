import express from "express";
import { 
  addToDownloads, 
  getUserDownloads, 
  removeDownload 
} from "../controllers/downloads.js";

const router = express.Router();

router.post("/save", addToDownloads);
router.get("/:userId", getUserDownloads);

router.delete("/:userId/:videoId", removeDownload); 

export default router;