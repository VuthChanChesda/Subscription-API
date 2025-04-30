import dayjs from "dayjs";
import { emailTemplates } from "./email-tamplate.js";
import { accountEmail , transporter } from "../config/nodeMailer.js";

export const sendReminderEmail = async ({to, type , subscription}) => {
    if (!to || !type || !subscription) {
        throw new Error("Missing required parameters");
    }
    const template = emailTemplates.find((t) => t.label === type);
    if (!template) {
        throw new Error("invalid email tamplate type");
    }
    const mailInfo = {
        userName: subscription.user.name,
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format("YYYY-MM-DD"),
        planName: subscription.name,
        price: `${subscription.price} ${subscription.currency} ${subscription.frequency}`,
        paymentMethod: subscription.paymentMethod,
    }
    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const mailOptions = {
        from: accountEmail,
        to: to ,
        subject: subject,
        html: message,

    }

    transporter.sendMail(mailOptions , (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            return;
        }
        console.log("Email sent:", info.response);
    });
    console.log("Email sent successfully");


}