import express from "express";
import { createStripeSession, verifyStripePayment } from "../controllers/payment.js";
import { checkDownloadLimit } from "../controllers/auth.js";

const router = express.Router();

router.post("/create-checkout-session", createStripeSession);
router.post("/verify-session", verifyStripePayment);
router.post("/check-limit", checkDownloadLimit);

export default router;