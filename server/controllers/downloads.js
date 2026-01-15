import Download from "../Modals/download.js";
import video from "../Modals/video.js";

export const addToDownloads = async (req, res) => {
  const { videoId, userId } = req.body;

  try {
    const existing = await Download.findOne({ userId, videoId });
    
    if (existing) {
      existing.downloadedAt = Date.now();
      await existing.save();
      return res.status(200).json({ message: "Download list updated" });
    }

    const newDownload = new Download({ userId, videoId });
    await newDownload.save();
    
    return res.status(201).json({ message: "Added to downloads" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserDownloads = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const downloads = await Download.find({ userId })
      .populate("videoId")
      .sort({ downloadedAt: -1 });

    return res.status(200).json(downloads);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const removeDownload = async (req, res) => {
  try {
    const { userId, videoId } = req.params;

    const deleted = await Download.findOneAndDelete({ userId, videoId });

    if (!deleted) {
      return res.status(404).json({ message: "Download record not found" });
    }

    return res.status(200).json({ message: "Removed from downloads" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};