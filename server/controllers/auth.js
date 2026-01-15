import mongoose from "mongoose";
import users from "../Modals/Auth.js"; 
import { sendOtp } from "../utils/Otpservice.js";
export const checkDownloadLimit = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.planType !== "Free") {
      return res.status(200).json({ allowed: true, message: `Premium User (${user.planType})` });
    }

    const today = new Date().toDateString(); 
    if (user.lastDownloadDate) {
      const lastDownload = new Date(user.lastDownloadDate).toDateString();
      if (lastDownload === today) {
        return res.status(403).json({ 
          allowed: false, 
          message: "Daily limit reached. Upgrade to download more." 
        });
      }
    }

    user.lastDownloadDate = new Date();
    await user.save();
    
    return res.status(200).json({ allowed: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const login = async (req, res) => {
  const { email, name, image, userState, mobile } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  const southStates = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Puducherry"];
  
  const isSouthIndia = userState && southStates.some(state => 
    userState.toLowerCase().includes(state.toLowerCase())
  );

  try {
    let user = await users.findOne({ email });
    if (!user) {
      user = await users.create({ email, name, image, planType: "Free", joinedOn: new Date() });0
    }

    let otpMethod = isSouthIndia ? "EMAIL" : "MOBILE" ;

    if (isSouthIndia) {
      otpMethod = "EMAIL";
    } else {
      if (!mobile && !user.mobile) {
        return res.status(400).json({ message: "Mobile number is required for your region." });
      }
      
      if (mobile) {
        user.mobile = mobile;
        await user.save();
      }
      otpMethod = "MOBILE";
    }

    const otpCode = await sendOtp(user, otpMethod);

    if (otpCode) {
      user.otp = otpCode;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
    }

    return res.status(200).json({ 
      result: user,
      message: `OTP sent via ${otpMethod}`,
      requireOtp: true,
      otpMethod: otpMethod
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await users.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({ result: user, message: "Verified" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ message: "User unavailable..." });
  }

  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
        },
      },
      { new: true } 
    );
    return res.status(200).json(updatedata); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const existingUser = await users.findOne({ email });
    
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ result: existingUser });
    
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};