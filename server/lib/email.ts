import sgMail from "@sendgrid/mail";

// Configure SendGrid if API key is present
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@reelrevive.com";
const APP_NAME = "ReelRevive";

/**
 * Sends a password reset email to the user.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
    const msg = {
        to,
        from: FROM_EMAIL,
        subject: `Reset Your ${APP_NAME} Password`,
        text: `You requested a password reset for your ${APP_NAME} account. Please click the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your <strong>${APP_NAME}</strong> account.</p>
        <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you did not request this reset, you can safely ignore this email.</p>
      </div>
    `,
    };

    if (!process.env.SENDGRID_API_KEY) {
        console.log("==========================================");
        console.log("SENDGRID_API_KEY is not set. Mocking email:");
        console.log(`TO: ${to}`);
        console.log(`SUBJECT: ${msg.subject}`);
        console.log(`RESET URL: ${resetUrl}`);
        console.log("==========================================");
        return;
    }

    try {
        await sgMail.send(msg);
        console.log(`Password reset email sent to: ${to}`);
    } catch (error: any) {
        console.error("Error sending email via SendGrid:", error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw new Error("Failed to send reset email");
    }
}

/**
 * Sends a verification email to the user.
 */
export async function sendVerificationEmail(to: string, verificationUrl: string) {
    const msg = {
        to,
        from: FROM_EMAIL,
        subject: `Verify Your ${APP_NAME} Email`,
        text: `Welcome to ${APP_NAME}! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nIf you did not sign up for an account, please ignore this email.`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Welcome to ${APP_NAME}!</h2>
        <p>Thanks for signing up! Please verify your email address to get full access to your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you did not create an account, you can safely ignore this email.</p>
      </div>
    `,
    };

    if (!process.env.SENDGRID_API_KEY) {
        console.log("==========================================");
        console.log("SENDGRID_API_KEY is not set. Mocking email:");
        console.log(`TO: ${to}`);
        console.log(`SUBJECT: ${msg.subject}`);
        console.log(`VERIFICATION URL: ${verificationUrl}`);
        console.log("==========================================");
        return;
    }

    try {
        await sgMail.send(msg);
        console.log(`Verification email sent to: ${to}`);
    } catch (error: any) {
        console.error("Error sending verification email via SendGrid:", error);
        throw new Error("Failed to send verification email");
    }
}
