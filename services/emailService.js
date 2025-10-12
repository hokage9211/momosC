// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendSalesReportEmail(subject, html) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject,
        html
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendSalesReportEmail };
