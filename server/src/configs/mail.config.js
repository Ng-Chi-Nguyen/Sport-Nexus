import nodemailer from "nodemailer";
console.log("Kiểm tra User:", process.env.EMAIL_ADMIN);
console.log("Kiểm tra pass:", process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS
    }
});

export { transporter };