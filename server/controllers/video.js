import video from "../Modals/video.js";
import path from "path";

export const uploadvideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(404)
      .json({ message: "plz upload a mp4 video file only" });
  } else {
    try {
      const file = new video({
        videotitle: req.body.videotitle,
        filename: req.file.originalname,
        filepath: req.file.path,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        videochanel: req.body.videochanel,
        uploader: req.body.uploader,
      });
      await file.save();
      return res.status(201).json("file uploaded successfully");
    } catch (error) {
      console.error(" error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const getallvideo = async (req, res) => {
  try {
    const files = await video.find();
    return res.status(200).send(files);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const downloadVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const videoData = await video.findById(id);

    if (!videoData) {
      return res.status(404).json({ message: "Video not found" });
    }

    const absolutePath = path.resolve(videoData.filepath);

    res.download(absolutePath, videoData.videotitle || "video.mp4", (err) => {
      if (err) {
        console.error("Download Error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Could not download the file." });
        }
      }
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};