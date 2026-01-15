import express from "express";
import { getallvideo, uploadvideo } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";
import { downloadVideo } from "../controllers/video.js";
const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadvideo);
routes.get("/download/:id", downloadVideo);
routes.get("/getall", getallvideo);
export default routes;
