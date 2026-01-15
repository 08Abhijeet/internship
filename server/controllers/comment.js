import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import geoip from "geoip-lite";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const likeComment = async (req, res) => {
  const { id } = req.params; 

  let userId = req.user ? req.user.id : null;
  if (!userId) {
    userId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  }

  try {
    const commentData = await comment.findById(id);
    
    const index = commentData.likes.findIndex((id) => id === String(userId));

    if (index === -1) {
      commentData.likes.push(userId);
      commentData.dislikes = commentData.dislikes.filter((id) => id !== String(userId));
    } else {
      commentData.likes = commentData.likes.filter((id) => id !== String(userId));
    }

    await commentData.save();
    
    res.status(200).json(commentData);
    
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const dislikeComment = async (req, res) => {
  const { id } = req.params;

  let userId = req.user ? req.user.id : null;
  if (!userId) {
    userId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  }

  try {
    const commentData = await comment.findById(id);

    const index = commentData.dislikes.findIndex((id) => id === String(userId));

    if (index === -1) {
      commentData.dislikes.push(userId);
      commentData.likes = commentData.likes.filter((id) => id !== String(userId));
    } else {
      commentData.dislikes = commentData.dislikes.filter((id) => id !== String(userId));
    }

    if (commentData.dislikes.length > 2) {
      await comment.findByIdAndDelete(id);
      return res.status(200).json({ 
          message: "Comment deleted due to excessive dislikes", 
          deleted: true 
      });
    }

    await commentData.save();
    res.status(200).json(commentData);

  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const postcomment = async (req, res) => {
  try {
    const commentdata = req.body;


    const postcomment = new comment(commentdata);
    await postcomment.save();
    
    return res.status(200).json({ 
        message: "Comment added", 
        city: commentdata.city, 
        comment: true 
    });

  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const translateComment = async (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ message: "Text and target language required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a translator. Translate the following text into ${targetLanguage}. 
    Do not add explanations. Do not put the text in quotes. Return ONLY the translated text.
    
    Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    return res.status(200).json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({ message: "Translation failed" });
  }
};