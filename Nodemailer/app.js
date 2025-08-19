require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const nodemailer = require("nodemailer");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/send-email", async (req, res) => {
  const { email, name, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptionsToOwner = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `📩 New message from ${name}`,
    text: `
        You received a new message from your website form:

        Name: ${name}
        Email: ${email}
        Message: ${message}`,
  };

  // Auto-reply to SENDER
  const autoReplyOptions = {
    from: process.env.EMAIL_USER, // must be your email
    to: email, // send back to sender
    subject: " We received your message",
    text: `Hi ${name},\n\nThanks for reaching out! We’ve received your message and will get back to you shortly.\n\nBest regards,\nYour Company`,
  };
  try {
    await transporter.sendMail(mailOptionsToOwner);
    await transporter.sendMail(autoReplyOptions);
 
    console.log("Email and auto-reply sent successfully");
    return res.status(200).send("Email and auto-reply sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).send("Error sending email");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
