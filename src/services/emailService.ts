// Email Service
// Supports SMTP (Turbo-SMTP, Gmail, etc.) and Mock mode for testing

const SMTP_HOST = import.meta.env.VITE_SMTP_HOST || 'pro.eu.turbo-smtp.com';
const SMTP_PORT = parseInt(import.meta.env.VITE_SMTP_PORT || '465'); // 465 for SSL, 587 for TLS
const SMTP_USERNAME = import.meta.env.VITE_SMTP_USERNAME || ''; // Consumer Key
const SMTP_PASSWORD = import.meta.env.VITE_SMTP_PASSWORD || ''; // Consumer Secret
const SMTP_FROM_EMAIL = import.meta.env.VITE_SMTP_FROM_EMAIL || 'noreply@growyourneed.com';
const EMAIL_PROVIDER = import.meta.env.VITE_EMAIL_PROVIDER || 'smtp'; // 'smtp' | 'mock'

export interface EmailMessage {
    to: string[];
    cc?: string[];
    bcc?: string[];
    from?: string;
    subject: string;
    html_body?: string;
    plain_body?: string;
    reply_to?: string;
    tag?: string;
}

export const emailService = {
    /**
     * Send an email via configured provider
     */
    async send(message: EmailMessage) {
        if (!SMTP_USERNAME || !SMTP_PASSWORD) {
            console.error('📧 [Email Service] Missing SMTP credentials');
            throw new Error('Email service not configured');
        }

        return this.sendViaSMTP(message);
    },

    /**
     * Send via SMTP (works with Turbo-SMTP, Gmail, etc.)
     * This creates a backend API call since SMTP can't be done from browser
     */
    async sendViaSMTP(message: EmailMessage) {
        try {
            // In production, this should call your backend API endpoint
            // Backend will use nodemailer to send via SMTP

            const emailData = {
                from: message.from || SMTP_FROM_EMAIL,
                to: message.to.join(', '),
                cc: message.cc?.join(', '),
                bcc: message.bcc?.join(', '),
                subject: message.subject,
                text: message.plain_body || '',
                html: message.html_body || message.plain_body || '',
                replyTo: message.reply_to
            };

            // For now, send to your backend API
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send email');
            }

            return await response.json();
        } catch (error) {
            console.error('SMTP Error:', error);
            throw error;
        }
    },

    /**
     * Send a welcome email template
     */
    async sendWelcome(to: string, name: string) {
        return this.send({
            to: [to],
            from: 'hello@growyourneed.com',
            subject: 'Welcome to Grow Your Need!',
            html_body: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #3b82f6;">Welcome, ${name}!</h1>
                    <p>We are thrilled to have you on board. Grow Your Need is your all-in-one platform for growth.</p>
                    <p>Get started by exploring your dashboard.</p>
                    <a href="${window.location.origin}/dashboard" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                </div>
            `,
            plain_body: `Welcome, ${name}! We are thrilled to have you on board. Go to your dashboard: ${window.location.origin}/dashboard`
        });
    },

    /**
     * Send password reset email
     */
    async sendPasswordReset(to: string, resetToken: string) {
        const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
        return this.send({
            to: [to],
            from: 'security@growyourneed.com',
            subject: 'Reset Your Password',
            html_body: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset. Click the link below to proceed:</p>
                    <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `,
            plain_body: `Reset your password here: ${resetUrl}`
        });
    }
};
