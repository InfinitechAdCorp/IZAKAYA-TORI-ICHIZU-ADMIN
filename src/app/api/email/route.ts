import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

interface EmailRequest {
  to: string
  reservationDetails: {
    name: string
    date: string
    time: string
    guests: number
    status: string
    special_requests?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()
    const { to, reservationDetails } = body

    console.log("=== Sending Email ===")
    console.log("To:", to)
    console.log("Status:", reservationDetails.status)

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_SECURE || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Format date and time
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const formatTime = (timeString: string) => {
      const [hours, minutes] = timeString.split(":")
      const hour = parseInt(hours)
      const minute = minutes || "00"
      const period = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minute} ${period}`
    }

    // Email content based on status
    let subject = ""
    let htmlContent = ""
    let textContent = ""

    const formattedDate = formatDate(reservationDetails.date)
    const formattedTime = formatTime(reservationDetails.time)

    switch (reservationDetails.status) {
      case "confirmed":
        subject = "Your Reservation is Confirmed! 🎉"
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .detail-label { font-weight: bold; color: #6b7280; }
                .detail-value { color: #111827; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Reservation Confirmed!</h1>
                </div>
                <div class="content">
                  <p>Dear ${reservationDetails.name},</p>
                  <p>Great news! Your reservation has been confirmed. We're looking forward to serving you!</p>
                  
                  <div class="details">
                    <h2 style="margin-top: 0; color: #10b981;">Reservation Details</h2>
                    <div class="detail-row">
                      <span class="detail-label">Date:</span>
                      <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Time:</span>
                      <span class="detail-value">${formattedTime}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Number of Guests:</span>
                      <span class="detail-value">${reservationDetails.guests}</span>
                    </div>
                    ${
                      reservationDetails.special_requests
                        ? `
                    <div class="detail-row">
                      <span class="detail-label">Special Requests:</span>
                      <span class="detail-value">${reservationDetails.special_requests}</span>
                    </div>
                    `
                        : ""
                    }
                  </div>
                  
                  <p>If you need to make any changes or have questions, please contact us.</p>
                  <p>We can't wait to see you!</p>
                  
                  <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
        textContent = `
Reservation Confirmed!

Dear ${reservationDetails.name},

Great news! Your reservation has been confirmed. We're looking forward to serving you!

Reservation Details:
- Date: ${formattedDate}
- Time: ${formattedTime}
- Number of Guests: ${reservationDetails.guests}
${reservationDetails.special_requests ? `- Special Requests: ${reservationDetails.special_requests}` : ""}

If you need to make any changes or have questions, please contact us.

We can't wait to see you!
        `
        break

      case "cancelled":
        subject = "Reservation Cancelled"
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .detail-label { font-weight: bold; color: #6b7280; }
                .detail-value { color: #111827; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Reservation Cancelled</h1>
                </div>
                <div class="content">
                  <p>Dear ${reservationDetails.name},</p>
                  <p>Your reservation has been cancelled as requested.</p>
                  
                  <div class="details">
                    <h2 style="margin-top: 0; color: #ef4444;">Cancelled Reservation Details</h2>
                    <div class="detail-row">
                      <span class="detail-label">Date:</span>
                      <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Time:</span>
                      <span class="detail-value">${formattedTime}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Number of Guests:</span>
                      <span class="detail-value">${reservationDetails.guests}</span>
                    </div>
                  </div>
                  
                  <p>We hope to serve you again in the future. If you'd like to make a new reservation, please don't hesitate to contact us.</p>
                  
                  <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
        textContent = `
Reservation Cancelled

Dear ${reservationDetails.name},

Your reservation has been cancelled as requested.

Cancelled Reservation Details:
- Date: ${formattedDate}
- Time: ${formattedTime}
- Number of Guests: ${reservationDetails.guests}

We hope to serve you again in the future. If you'd like to make a new reservation, please don't hesitate to contact us.
        `
        break

      case "pending":
        subject = "Reservation Status: Pending Review"
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .detail-label { font-weight: bold; color: #6b7280; }
                .detail-value { color: #111827; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Reservation Pending</h1>
                </div>
                <div class="content">
                  <p>Dear ${reservationDetails.name},</p>
                  <p>Your reservation is currently pending review. We'll get back to you shortly with confirmation.</p>
                  
                  <div class="details">
                    <h2 style="margin-top: 0; color: #f59e0b;">Reservation Details</h2>
                    <div class="detail-row">
                      <span class="detail-label">Date:</span>
                      <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Time:</span>
                      <span class="detail-value">${formattedTime}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Number of Guests:</span>
                      <span class="detail-value">${reservationDetails.guests}</span>
                    </div>
                    ${
                      reservationDetails.special_requests
                        ? `
                    <div class="detail-row">
                      <span class="detail-label">Special Requests:</span>
                      <span class="detail-value">${reservationDetails.special_requests}</span>
                    </div>
                    `
                        : ""
                    }
                  </div>
                  
                  <p>You'll receive another email once your reservation is confirmed.</p>
                  
                  <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
        textContent = `
Reservation Pending

Dear ${reservationDetails.name},

Your reservation is currently pending review. We'll get back to you shortly with confirmation.

Reservation Details:
- Date: ${formattedDate}
- Time: ${formattedTime}
- Number of Guests: ${reservationDetails.guests}
${reservationDetails.special_requests ? `- Special Requests: ${reservationDetails.special_requests}` : ""}

You'll receive another email once your reservation is confirmed.
        `
        break
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"Restaurant Reservations" <${process.env.SMTP_FROM}>`,
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent,
    })

    console.log("✅ Email sent successfully:", info.messageId)

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    })
  } catch (error) {
    console.error("❌ Email sending error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
