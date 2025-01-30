import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

const sendMail = (email, otp) => {
    transporter.sendMail({
        to: email,
        subject: "Your One-Time Password (OTP) for Login",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #0056b3;">Welcome to ChatSphere! 🎉</h2>
                <p>Hello <strong>${email}</strong>,</p>
                <p>Your One-Time Password (OTP) for login is:</p>
                <div style="font-size: 24px; font-weight: bold; color: #0056b3; background: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;">
                    ${otp}
                </div>
                <p>This OTP is valid for <strong>2 minutes</strong>. Please do not share it with anyone.</p>
                <p>If you did not request this, please ignore this email or <a href="mailto:support@chatsphere.com" style="color: #0056b3;">contact our support</a>.</p>
                <br/>
                <p>Best regards,</p>
                <p><strong>ChatSphere Team</strong></p>
            </div>
        `
    });
    console.log("Mail sent successfully");
}

// sendMail('senderEmail@XYZ.com', "D54BK6");

export { sendMail };