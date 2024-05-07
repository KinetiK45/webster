const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});

async function sendEmail(to, subject, htmlPromise) {
    try {
        const html = await htmlPromise;
        const mailOptions = {
            to: to,
            subject: subject,
            html: html,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info);
    } catch (err) {
        console.error('Error sending email:', err);
    }
}
module.exports = sendEmail;