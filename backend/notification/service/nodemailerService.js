const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(process.env.STMP_URL);

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