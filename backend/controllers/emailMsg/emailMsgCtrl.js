const expressAsyncHandler = require("express-async-handler");
const API_KEY = process.env.API_KEY;
const DOMAIN = process.env.DOMAIN;
const mailgun = require("mailgun-js");
const Filter = require("bad-words");
const EmailMsg = require("../../models/EmailMessaging/EmailMessaging");
const sgMail = mailgun({ apiKey: API_KEY, domain: DOMAIN });

const sendEmailMsgCtrl = expressAsyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;
  // get the message
  const emailMessage = subject + " " + message;
  // Prevent bad words
  const filter = new Filter();
  const isProfane = filter.isProfane(emailMessage);
  if (isProfane) throw new Error("Email sent failed.");
  try {
    // build up msg
    const msg = {
      to,
      subject,
      text: message,
      from: "ndre322@gmail.com",
    };
    // send the message
    await sgMail.messages().send(msg);
    // Save to our DB
    await EmailMsg.create({
      sentBy: req?.user?._id,
      from: req?.user?.email,
      to,
      message,
      subject,
    });
    res.json("Mail sent");
  } catch (error) {
    res.json(error);
  }
});

module.exports = { sendEmailMsgCtrl };
