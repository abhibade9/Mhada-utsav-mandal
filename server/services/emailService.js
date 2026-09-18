import nodemailer from "nodemailer";

/**
 * Isolated server-side email service for MHADA Towers Utsav Mandal.
 * Supports production SMTP and safe development simulation.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        console.log(`[EmailService] Configured SMTP transporter with host: ${host}`);
      } catch (err) {
        console.warn(`[EmailService] Failed to initialize SMTP transporter: ${err.message}`);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
      console.log(
        "[EmailService] No active SMTP credentials found in environment. Email service running in simulation mode for local testing."
      );
    }
  }

  async sendEmail({ to, subject, text, html }) {
    if (!to || !to.trim()) {
      throw new Error("Recipient email address is required.");
    }
    if (!subject || !subject.trim()) {
      throw new Error("Email subject is required.");
    }
    if (!text || !text.trim()) {
      throw new Error("Email body content is required.");
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      `"MHADA Towers Utsav Mandal" <${process.env.SMTP_USER || "mhadatowersutsavmandal@gmail.com"}>`;

    // Re-check transporter if env changed
    if (!this.transporter && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.initTransporter();
    }

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: to.trim(),
          subject: subject.trim(),
          text: text.trim(),
          html: html || text.trim().replace(/\n/g, "<br/>"),
        });
        console.log(`[EmailService] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        return {
          success: true,
          messageId: info.messageId,
          simulated: false,
        };
      } catch (error) {
        console.error(`[EmailService] Failed to dispatch email via SMTP to ${to}:`, error.message);
        throw new Error(`SMTP dispatch error: ${error.message}`);
      }
    }

    // Development / Local fallback mode (when no SMTP credentials exist in env)
    console.log("==========================================================");
    console.log("[EmailService - SIMULATED EMAIL DISPATCH]");
    console.log(`From:    ${fromAddress}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Body:");
    console.log(text);
    console.log("==========================================================");

    return {
      success: true,
      simulated: true,
      message: "Email sent (Simulated in local development mode).",
    };
  }

  async sendPasswordResetEmail({ to, resetUrl, adminName = "Admin" }) {
    const subject = "🔐 म्हाडा टॉवर्स उत्सव मंडळ: व्यवस्थापक पासवर्ड रीसेट लिंक (Admin Password Reset)";
    const text = `
नमस्कार ${adminName},

तुम्ही म्हाडा टॉवर्स गणेशोत्सव मंडळाच्या व्यवस्थापक खात्यासाठी पासवर्ड रीसेट करण्याची विनंती केली आहे.

खालील लिंकवर क्लिक करून नवीन पासवर्ड तयार करा:
${resetUrl}

महत्त्वाची सूचना:
• हा पासवर्ड रीसेट दुवा पुढील १५ मिनिटांसाठी वैध आहे (Valid for 15 minutes only).
• हा दुवा फक्त एकदाच वापरता येईल (Single-use only).
• जर तुम्ही ही विनंती केली नसेल, तर कृपया या ईमेलकडे दुर्लक्ष करा.

- म्हाडा टॉवर्स उत्सव मंडळ, पिंपरी चिंचवड
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fffdf9; color: #331505; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 2px solid #d4af37; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4a0404, #7f1d1d); color: #fef08a; padding: 24px; text-align: center; border-bottom: 2px solid #d4af37; }
    .content { padding: 28px; line-height: 1.6; }
    .btn { display: inline-block; background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 15px; margin: 20px 0; border: 1px solid #fef08a; }
    .note { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #92400e; margin: 18px 0; }
    .footer { background: #fdf6e7; padding: 16px; text-align: center; font-size: 12px; color: #78350f; border-top: 1px solid #fde68a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 32px; margin-bottom: 4px;">🕉️</div>
      <h2 style="margin: 0; font-size: 20px; color: #fef08a;">म्हाडा टॉवर्स गणेशोत्सव मंडळ</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #fde68a;">व्यवस्थापक पासवर्ड रीसेट (Admin Password Reset)</p>
    </div>
    <div class="content">
      <p>नमस्कार <b>${adminName}</b>,</p>
      <p>तुम्ही म्हाडा टॉवर्स उत्सव मंडळाच्या व्यवस्थापक खात्यासाठी पासवर्ड रीसेट करण्याची विनंती केली आहे.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn" target="_blank">पासवर्ड रीसेट करा (Reset Password) →</a>
      </div>
      <p style="font-size: 12px; word-break: break-all; color: #6b7280;">
        किंवा खालील लिंक कॉपी करून ब्राउझरमध्ये उघडा:<br/>
        <a href="${resetUrl}" style="color: #b45309;">${resetUrl}</a>
      </p>
      <div class="note">
        <b>महत्त्वाची सुरक्षा सूचना:</b><br/>
        • हा पासवर्ड रीसेट दुवा पुढील <b>१५ मिनिटांसाठीच</b> वैध आहे (Valid for 15 minutes).<br/>
        • हा दुवा फक्त एकदाच वापरता येईल (Single-use only).<br/>
        • जर तुम्ही ही विनंती केली नसेल, तर कृपया या ईमेलकडे दुर्लक्ष करा. तुमचा आधीचा पासवर्ड सुरक्षित राहील.
      </div>
    </div>
    <div class="footer">
      म्हाडा टॉवर्स उत्सव मंडळ, पिंपरी वाघेरे, पुणे - ४११०१७
    </div>
  </div>
</body>
</html>
    `.trim();

    return await this.sendEmail({ to, subject, text, html });
  }
}

const emailService = new EmailService();
export default emailService;
