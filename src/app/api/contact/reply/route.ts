import nodemailer from "nodemailer"

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request: Request) {
  try {
    const { to, name, subject, message, originalMessage } = await request.json()

    // Validate required fields
    if (!to || !name || !subject || !message) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create email HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name},</h2>
          <p style="color: #666; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            <strong>Original Message:</strong><br>
            <em>${originalMessage.replace(/\n/g, "<br>")}</em>
          </p>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px; color: #999; font-size: 12px;">
          <p style="margin: 0;">Best regards,<br><strong>IZAKAYA TORI ICHIZU Team</strong></p>
        </div>
      </div>
    `

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      html: htmlContent,
      replyTo: process.env.SMTP_FROM,
    })

    return Response.json({
      success: true,
      message: "Reply sent successfully",
    })
  } catch (error) {
    console.error("Error sending reply:", error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send reply",
      },
      { status: 500 },
    )
  }
}
