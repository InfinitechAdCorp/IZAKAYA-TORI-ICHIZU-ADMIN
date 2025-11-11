import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message } = body

    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <tr>
                  <td style="background-image: linear-gradient(135deg, #f97316 0%, #ef4444 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); letter-spacing: -0.5px;">
                      Izakaya Tori Ichizu
                    </h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 15px; opacity: 0.95; font-weight: 500;">
                      Customer Communication
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="margin: 0 0 30px 0; color: #111827; font-size: 24px; font-weight: 600; line-height: 1.3;">
                      ${subject}
                    </h2>
                    <div style="color: #374151; font-size: 16px; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word;">
                      ${message}
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 500;">
                      This email was sent from Izakaya Tori Ichizu
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px;">
                      © ${new Date().getFullYear()} Izakaya Tori Ichizu. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // Send email with HTML content
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: message, // Plain text fallback
      html: htmlContent, // HTML version
    })

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("[API] Error sending email:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    )
  }
}
