import Stripe from "stripe";
import User from "../Modals/Auth.js";
import { sendInvoiceEmail } from "../utils/emailService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripeSession = async (req, res) => {
  try {
    const { planName, price, userId, videoId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: `${planName} Plan Membership` },
            unit_amount: price * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/watch/${videoId}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/watch/${videoId}?payment_cancelled=true`,
  
      metadata: { 
        userId: String(userId),    
        planName: String(planName) 
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    res.status(500).json({ message: "Payment setup failed" });
  }
};

export const verifyStripePayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const userId = session.metadata.userId;
      const planName = session.metadata.planName; 
      const amount = session.amount_total / 100;

      console.log(`🔍 Processing Upgrade for User: ${userId} -> Plan: ${planName}`);

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            planType: planName,  
            isPremium: true      
          } 
        },
        { new: true } 
      );

      if (updatedUser) {
        console.log("✅ Database Updated Successfully:", updatedUser.planType);
        
        sendInvoiceEmail(updatedUser.email, updatedUser.name, planName, amount)
          .catch(e => console.error("Email Error:", e.message));

        return res.json({ success: true, result: updatedUser });
      } else {
        console.error("❌ User Not Found in DB:", userId);
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("❌ Verification Failed:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};