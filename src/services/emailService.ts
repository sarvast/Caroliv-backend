import nodemailer from 'nodemailer';

// Configure the email transporter
// We use a function to create it so we can pick up the latest env vars
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS, // App Password
        },
    });
};

/**
 * Sends an OTP email to the user
 * @param to Recipient email
 * @param otp The 6-digit OTP code update
 */
export const sendOtpEmail = async (to: string, otp: string): Promise<boolean> => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.warn('⚠️ Email credentials missing. MOCK MODE: Logged OTP for dev testing:');
        console.log(`🔑 OTP for ${to}: [ ${otp} ]`);
        return true; // Return true so the flow continues in mock mode
    }

    const transporter = createTransporter();

    const mailOptions = {
        from: `"Caloriv Security" <${process.env.GMAIL_USER}>`,
        to: to,
        subject: 'Caloriv Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your Caloriv account.</p>
                <p>Your OTP code is:</p>
                <h1 style="color: #4f46e5; letter-spacing: 5px;">${otp}</h1>
                <p>This code expires in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent to ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        console.warn('⚠️ FALLBACK: Email failed, but logging OTP to terminal for dev testing:');
        console.log(`🔑 OTP for ${to}: [ ${otp} ]`);
        return true; // Return true so the flow continues in mock mode despite send error
    }
};
