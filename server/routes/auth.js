import express from "express";
import { login, updateprofile,verifyOtp, getUserDetails } from "../controllers/auth.js";
const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateprofile);
routes.post("/verify-otp", verifyOtp);
routes.post("/get-user", getUserDetails);
export default routes;
