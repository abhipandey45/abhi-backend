import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }) {
    try {
        if (!process.env.SMTP_HOST) {
            console.log('[Email disabled] Would send to:', to, subject, text);
            return { disabled: true };
        }
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL || 'no-reply@edu-tech.local',
            to,
            subject,
            text,
            html
        });
        return { messageId: info.messageId };
    } catch (err) {
        console.error('Email error:', err.message);
        throw err;
    }
}