var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from "nodemailer";
export function sendEmail(email_receiver, subject, mail_message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.NODEMAILER_EMAIL,
                    pass: process.env.NODEMAILER_PASSWORD,
                },
            });
            return yield transporter.sendMail({
                from: `"Pasal 🛒"<${process.env.NODEMAILER_EMAIL}>`,
                to: email_receiver,
                subject: subject,
                html: mail_message,
            });
        }
        catch (error) {
            console.log(error.message);
        }
    });
}
