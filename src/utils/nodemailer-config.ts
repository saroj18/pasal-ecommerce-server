import nodemailer from "nodemailer";

export async function sendEmail(
  email_receiver: string,
  subject: string,
  mail_message: string
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    return await transporter.sendMail({
      from: `"Pasal 🛒"<${process.env.NODEMAILER_EMAIL}>`,
      to: email_receiver,
      subject: subject,
      html: mail_message,
    });
  } catch (error) {
    console.log(error.message);
  }
}
