const verifyEmailTemplate = ({ firstName, verificationUrl, otp }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #0F0F14; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #16161F; border: 1px solid #2A2A3A; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1238, #3D3F6E); padding: 40px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #818CF8; }
    .body { padding: 40px 30px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; }
    .otp-box { background: #1E1E2A; border: 2px solid #818CF8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp { font-size: 40px; font-weight: 800; color: #818CF8; letter-spacing: 8px; }
    .otp-label { font-size: 12px; color: #6B6B8A; margin-top: 8px; }
    .btn { display: inline-block; background: #818CF8; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 10px 0; }
    .warning { font-size: 13px; color: #F87171; margin-top: 16px; }
    .footer { padding: 20px 30px; text-align: center; border-top: 1px solid #2A2A3A; }
    .footer-text { font-size: 12px; color: #6B6B8A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚡ DEVAD TECH ACADEMY</div>
    </div>
    <div class="body">
      <div class="title">Verify Your Email 📧</div>
      <p class="text">Hi ${firstName}, please verify your email address to activate your Devad Tech Academy account.</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
        <div class="otp-label">Your verification code — valid for 10 minutes</div>
      </div>
      <p class="text">Or click the button below to verify directly:</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="btn">Verify Email →</a>
      </div>
      <p class="warning">⚠️ If you didn't create an account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default verifyEmailTemplate;