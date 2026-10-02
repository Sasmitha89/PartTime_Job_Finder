const nodemailer = require("nodemailer");

const isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for others (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Sends a real email if SMTP is configured in .env. If not, prints the
// email content (including any reset link) straight to the server
// console instead — so the whole flow can be tested before real email
// is wired up, and nothing ever silently fails during development.
async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.log("\n===== EMAIL (SMTP not configured — printed instead) =====");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(text);
    console.log("===========================================================\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
}

module.exports = { sendMail };
