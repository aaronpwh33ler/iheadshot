import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

// Email: Order confirmed
export async function sendOrderConfirmation(
  email: string,
  orderId: string,
  tier: string,
  headshotCount: number
): Promise<boolean> {
  const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upload/${orderId}`;

  return sendEmail({
    to: email,
    subject: "Your Headshot Order is Confirmed! 📸",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #111827; margin-bottom: 24px;">Order Confirmed! 🎉</h1>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you for your order! You've selected the <strong>${tier}</strong> package
              with <strong>${headshotCount} professional headshots</strong>.
            </p>

            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="color: #111827; margin-top: 0;">Next Step: Upload Your Photos</h3>
              <p style="color: #4b5563; margin-bottom: 16px;">
                Upload 10-15 photos of yourself and we'll generate your professional headshots in about 30 minutes.
              </p>
              <a href="${uploadUrl}" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                Upload Photos Now →
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
              <h4 style="color: #111827; margin-bottom: 12px;">Photo Tips for Best Results:</h4>
              <ul style="color: #4b5563; padding-left: 20px; line-height: 1.8;">
                <li>Use clear, well-lit photos</li>
                <li>Include different angles and expressions</li>
                <li>Avoid group photos or photos with sunglasses</li>
                <li>Recent photos work best</li>
              </ul>
            </div>

            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
              Order ID: ${orderId}
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

// Email: Training started
export async function sendTrainingStarted(
  email: string,
  orderId: string
): Promise<boolean> {
  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/processing/${orderId}`;

  return sendEmail({
    to: email,
    subject: "Your AI is Learning Your Face! 🤖",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #111827; margin-bottom: 24px;">We're Creating Your Headshots! 🎨</h1>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Our AI is now learning your unique features. This usually takes about
              <strong>15-30 minutes</strong>, and then we'll generate your professional headshots.
            </p>

            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="color: #92400e; margin: 0;">
                ⏱️ <strong>Estimated completion:</strong> ~30 minutes from now
              </p>
            </div>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We'll email you as soon as your headshots are ready. You can also check the status anytime:
            </p>

            <a href="${statusUrl}" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 16px;">
              Check Status →
            </a>

            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
              Order ID: ${orderId}
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

// Email: Headshots ready
export async function sendHeadshotsReady(
  email: string,
  orderId: string,
  imageCount: number
): Promise<boolean> {
  const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${orderId}`;

  return sendEmail({
    to: email,
    subject: "Your Professional Headshots Are Ready! 🌟",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #111827; margin-bottom: 24px;">Your Headshots Are Ready! 🎉</h1>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Great news! We've generated <strong>${imageCount} professional headshots</strong>
              just for you. They're ready for download now.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${galleryUrl}" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                View Your Headshots →
              </a>
            </div>

            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h4 style="color: #111827; margin-top: 0;">What you can do:</h4>
              <ul style="color: #4b5563; padding-left: 20px; line-height: 1.8; margin-bottom: 0;">
                <li>Download individual photos</li>
                <li>Download all photos as a ZIP file</li>
                <li>Share directly to LinkedIn</li>
              </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Your photos will be available for 30 days. Make sure to download your favorites!
            </p>

            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
              Order ID: ${orderId}
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

// Email: Generation failed
export async function sendGenerationFailed(
  email: string,
  orderId: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Issue With Your Headshot Order",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #111827; margin-bottom: 24px;">We Hit a Snag 😕</h1>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We encountered an issue while generating your headshots. Don't worry—we're
              looking into it and will either retry automatically or reach out with next steps.
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              If you don't hear from us within 24 hours, please reply to this email and
              we'll make it right.
            </p>

            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
              Order ID: ${orderId}
            </p>
          </div>
        </body>
      </html>
    `,
  });
}
