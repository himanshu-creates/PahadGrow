import { Router } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ success: false, message: 'Invalid email' });

    // 1. User ko confirmation mail
    await transporter.sendMail({
      from: `"PahadGrow" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: '🌱 PahadGrow Newsletter ke liye Shukriya!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="background: #166534; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌱 PahadGrow</h1>
            <p style="color: #bbf7d0; margin: 4px 0 0; font-size: 12px;">CULTIVATING GROWTH FROM THE HILLS</p>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <h2 style="color: #166534; margin: 0 0 16px;">Shukriya Subscribe karne ke liye! 🙏</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Aap ab PahadGrow newsletter ke sadasya ban gaye hain! Ab aapko milega:
            </p>
            <div style="background: #dcfce7; border-left: 4px solid #166534; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 2;">
                <li>🌾 Latest farming tips aur tricks</li>
                <li>🏔️ Pahadi community stories</li>
                <li>📦 Naye products ki jankari</li>
                <li>💰 Special offers aur discounts</li>
              </ul>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://pahad-grow.vercel.app" 
                 style="background: #166534; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                PahadGrow Visit Karein →
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center;">
              Pahadon ki taraf se dher saari shubhkamnayein! 🏔️
            </p>
          </div>
        </div>
      `,
    });

    // 2. Admin ko notification
    await transporter.sendMail({
      from: `"PahadGrow" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      subject: '🔔 New Newsletter Subscriber!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="background: #166534; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🔔 New Subscriber!</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 12px;">Naya newsletter subscriber hai:</p>
            <div style="background: #dcfce7; border-radius: 8px; padding: 16px; text-align: center;">
              <p style="color: #166534; font-size: 20px; font-weight: bold; margin: 0;">${email}</p>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin: 16px 0 0; text-align: center;">
              Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Successfully subscribed!' });
  } catch (err) {
    console.error('[NEWSLETTER]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
11