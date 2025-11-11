import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendBookingEmailParams {
  to: string;
  customerName: string;
  eventId: number;
  eventType: string;
  guests: number;
  preferredDate: string;
  preferredTime: string;
  venueArea: string;
  status: 'confirmed' | 'cancelled';
  reason?: string;
}

export async function sendBookingStatusEmail({
  to,
  customerName,
  eventId,
  eventType,
  guests,
  preferredDate,
  preferredTime,
  venueArea,
  status,
  reason,
}: SendBookingEmailParams) {
  const isConfirmed = status === 'confirmed';
  const subject = isConfirmed
    ? `✅ Booking Confirmed - Event #${eventId}`
    : `❌ Booking Declined - Event #${eventId}`;

  const formattedDate = new Date(preferredDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: ${isConfirmed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1f2937;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          .details-box {
            background-color: #f9fafb;
            border-left: 4px solid ${isConfirmed ? '#10b981' : '#ef4444'};
            padding: 20px;
            margin: 25px 0;
            border-radius: 6px;
          }
          .details-title {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .detail-item {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-item:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #6b7280;
            min-width: 140px;
          }
          .detail-value {
            color: #1f2937;
            font-weight: 500;
          }
          .reason-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
          }
          .reason-title {
            font-size: 15px;
            font-weight: 700;
            color: #dc2626;
            margin-bottom: 10px;
          }
          .reason-text {
            font-size: 15px;
            color: #991b1b;
            line-height: 1.6;
          }
          .cta-button {
            display: inline-block;
            padding: 14px 32px;
            background: ${isConfirmed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'};
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
            font-size: 16px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #6b7280;
          }
          .contact-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isConfirmed ? '🎉 Booking Confirmed!' : '📋 Booking Status Update'}</h1>
            <p>Event #${eventId}</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Dear ${customerName},
            </div>
            
            <div class="message">
              ${
                isConfirmed
                  ? `We are delighted to confirm your event booking! Your reservation has been successfully processed and we look forward to hosting your special occasion.`
                  : `Thank you for your interest in booking with us. We regret to inform you that we are unable to confirm your booking at this time.`
              }
            </div>

            ${
              !isConfirmed && reason
                ? `
            <div class="reason-box">
              <div class="reason-title">Reason for Decline:</div>
              <div class="reason-text">${reason}</div>
            </div>
            `
                : ''
            }
            
            <div class="details-box">
              <div class="details-title">Booking Details</div>
              <div class="detail-item">
                <span class="detail-label">Event Type:</span>
                <span class="detail-value">${eventType.charAt(0).toUpperCase() + eventType.slice(1)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Number of Guests:</span>
                <span class="detail-value">${guests} people</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${preferredTime}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Venue Area:</span>
                <span class="detail-value">${venueArea.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>

            ${
              isConfirmed
                ? `
            <div class="message">
              <strong>Next Steps:</strong><br>
              • Our team will contact you within 24 hours to finalize the details<br>
              • Please keep this email for your records<br>
              • If you need to make any changes, please contact us as soon as possible
            </div>
            `
                : `
            <div class="message">
              ${
                reason
                  ? 'We would be happy to help you find an alternative date or discuss other options that might work better for your event.'
                  : 'Please feel free to submit another booking request or contact us to discuss alternative arrangements.'
              }
            </div>
            `
            }
            
            <div style="text-align: center;">
              <a href="mailto:${process.env.SMTP_FROM}" class="cta-button">
                ${isConfirmed ? 'Contact Us' : 'Book Another Date'}
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Need Help?</strong></p>
            <div class="contact-info">
              <p>📧 Email: ph.toriichizu01@gmail.com </p>
              <p>📱 Phone: (02) 8362 0676 </p>
              <p>🌐 Website: Izakayatoriichizu.com</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
              This email was sent from an automated system. Please do not reply directly to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Dear ${customerName},

${
  isConfirmed
    ? `We are delighted to confirm your event booking! Your reservation has been successfully processed.`
    : `Thank you for your interest in booking with us. We regret to inform you that we are unable to confirm your booking at this time.`
}

${!isConfirmed && reason ? `Reason: ${reason}\n` : ''}

BOOKING DETAILS:
Event #: ${eventId}
Event Type: ${eventType}
Guests: ${guests} people
Date: ${formattedDate}
Time: ${preferredTime}
Venue: ${venueArea.replace('_', ' ').toUpperCase()}

${
  isConfirmed
    ? `Next Steps:
- Our team will contact you within 24 hours
- Keep this email for your records
- Contact us if you need to make changes`
    : 'Please feel free to contact us to discuss alternative arrangements.'
}

Contact Information:
Email: ${process.env.SMTP_FROM}
Website: ${process.env.NEXT_PUBLIC_API_URL}

Best regards,
The Events Team
  `;

  try {
    await transporter.sendMail({
      from: `"Events Booking" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
