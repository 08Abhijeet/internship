import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "abhijeetkadam656@gmail.com",
    pass: "qbgp yuvp yjwl pxhu",
  },
});

export const sendInvoiceEmail = async (userEmail, userName, planName, amount) => {
  const mailOptions = {
    from: '"YouTube Clone Support" <your-company-email@gmail.com>',
    to: userEmail,
    subject: `Invoice: ${planName} Plan Upgrade`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Payment Successful</h2>
        <p>Hi ${userName},</p>
        <p>This is a receipt for your <strong>${planName}</strong> plan.</p>
        <p>Amount Paid: <strong>₹${amount}</strong></p>
        <p>Thank you!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invoice sent successfully to: ${userEmail}`);
  } catch (error) {
    console.error("❌ Email Failed:", error.message);
  }
};