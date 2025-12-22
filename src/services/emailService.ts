import nodemailer from 'nodemailer';

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { logger } from '../lib/logger';

// Configure the email transporter
// We use a function to create it so we can pick up the latest env vars
const createTransporter = () => {
    let user = (process.env.GMAIL_USER || '').trim();
    let rawPass = process.env.GMAIL_PASS || '';

    // FALLBACK: Try reading env.prod directly from ROOT (Safe for dist/ vs src/)
    const prodEnvPath = path.resolve(process.cwd(), 'env.prod');
    if (fs.existsSync(prodEnvPath)) {
        console.log(`[DEBUG] Found env.prod at ${prodEnvPath}, reading credentials...`);
        const envConfig = dotenv.parse(fs.readFileSync(prodEnvPath));
        if (envConfig.GMAIL_USER) user = envConfig.GMAIL_USER.trim();
        if (envConfig.GMAIL_PASS) rawPass = envConfig.GMAIL_PASS;
    }

    // Aggressively remove EVERY non-letter character including hidden ones
    const pass = rawPass.replace(/[^a-zA-Z]/g, '');

    console.log(`[DEBUG] SMTP DIAGNOSTICS:`);
    console.log(`- User: [${user}]`);
    console.log(`- Cleaned Length: ${pass.length}`);

    if (pass.length > 0) {
        // Show only first and last char for security but verify they are what we expect
        console.log(`- First: ${pass[0]}, Last: ${pass[pass.length - 1]}`);
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
};

/**
 * Sends an OTP email to the user
 * @param to Recipient email
 * @param otp The 6-digit OTP code update
 */
export const sendOtpEmail = async (to: string, otp: string): Promise<boolean> => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.warn('⚠️ Email Configuration Missing:');
        if (!process.env.GMAIL_USER) console.warn('   - GMAIL_USER is NOT set in .env');
        if (!process.env.GMAIL_PASS) console.warn('   - GMAIL_PASS is NOT set in .env');
        console.warn('🛠️ MOCK MODE: Logged OTP for dev testing:');
        console.log(`🔑 OTP for ${to}: [ ${otp} ]`);
        return true;
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
