import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String },
  channelname: { type: String },
  description: { type: String },
  planType: { type: String, default: "Free" },
  joinedOn: { type: Date, default: Date.now },
  mobile: { type: String, default: "" },
  lastDownloadDate: { type: Date, default: null },
  otp: { type: String }, 
  otpExpires: { type: Date } 
});

export default mongoose.model("User", userSchema);