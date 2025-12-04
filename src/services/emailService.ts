// Postal Email Service
// Documentation: https://docs.postalserver.io/

const POSTAL_URL = import.meta.env.VITE_POSTAL_URL || 'http://localhost:5000';
const POSTAL_API_KEY = import.meta.env.VITE_POSTAL_API_KEY || 'postal_api_key';

export interface EmailMessage {
    to: string[];
    cc?: string[];
    bcc?: string[];
    from: string;
    subject: string;
    html_body?: string;
    plain_body?: string;
    reply_to?: string;
    tag?: string;
}

export const emailService = {
    /**
     * Send an email via Postal API
     */
    async send(message: EmailMessage) {
        try {
            const response = await fetch(`${POSTAL_URL}/api/v1/send/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Server-API-Key': POSTAL_API_KEY
                },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.data?.message || 'Failed to send email');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending email:', error);
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
