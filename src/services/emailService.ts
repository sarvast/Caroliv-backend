import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || process.env.GMAIL_USER,
                pass: process.env.SMTP_PASS || process.env.GMAIL_PASS,
            },
        });
    }

    async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
        const user = process.env.SMTP_USER || process.env.GMAIL_USER;
        const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

        if (!user || !pass) {
            logger.warn('SMTP credentials not found. Skipping welcome email.');
            return false;
        }

        const subject = 'Welcome to Caloriv! 🚀';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #a855f7; text-align: center;">Welcome to Caloriv!</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>We're thrilled to have you on board! You've taken the first step towards a healthier, fitter you.</p>
                <p>With Caloriv, you can:</p>
                <ul>
                    <li>Track your daily calories and macros 🍎</li>
                    <li>Log your workouts and monitor progress 💪</li>
                    <li>Get personalized AI insights 🤖</li>
                </ul>
                <p>If you have any questions or feedback, feel free to reply to this email.</p>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://caloriv.vercel.app/" style="background-color: #a855f7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
                </p>
                <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">© ${new Date().getFullYear()} Caloriv. All rights reserved.</p>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: '"Caloriv Team" <' + user + '>',
                to,
                subject,
                html,
            });
            logger.info('Welcome email sent successfully', { to });
            return true;
        } catch (error) {
            logger.error('Failed to send welcome email', error);
            return false;
        }
    }

    async sendOtpEmail(to: string, otp: string): Promise<boolean> {
        const user = process.env.SMTP_USER || process.env.GMAIL_USER;
        const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

        if (!user || !pass) {
            logger.warn('SMTP credentials not found. Skipping OTP email.');
            return false;
        }

        const subject = 'Your Caloriv Password Reset OTP';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #a855f7; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested a password reset for your Caloriv account. Use the OTP below to proceed:</p>
                <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                </div>
                <p>This OTP is valid for 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">© ${new Date().getFullYear()} Caloriv. All rights reserved.</p>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: '"Caloriv Team" <' + user + '>',
                to,
                subject,
                html,
            });
            logger.info('OTP email sent successfully', { to });
            return true;
        } catch (error) {
            logger.error('Failed to send OTP email', error);
            return false;
        }
    }
}

export const emailService = new EmailService();

export const sendOtpEmail = (to: string, otp: string) => emailService.sendOtpEmail(to, otp);
