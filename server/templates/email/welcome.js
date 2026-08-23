const welcomeTemplate = ({ firstName }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Devad Tech Academy</title>
  <style>
    body { margin: 0; padding: 0; background: #0F0F14; font-family: 'Inter', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #16161F; border: 1px solid #2A2A3A; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1238, #3D3F6E); padding: 40px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #818CF8; letter-spacing: 1px; }
    .body { padding: 40px 30px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; }
    .btn { display: inline-block; background: #818CF8; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 20px 0; }
    .feature { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #2A2A3A; }
    .feature-icon { font-size: 20px; }
    .feature-text { font-size: 14px; color: #9999B8; }
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
      <div class="title">Welcome, ${firstName}! 🎉</div>
      <p class="text">You've just joined Nigeria's most practical tech school. We're excited to have you on board and can't wait to see what you'll build!</p>
      <div class="feature">
        <span class="feature-icon">📚</span>
        <span class="feature-text">Access to all courses and live classes</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🚀</span>
        <span class="feature-text">Build real projects for your portfolio</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🏅</span>
        <span class="feature-text">Earn certificates employers recognize</span>
      </div>
      <div class="feature">
        <span class="feature-icon">👥</span>
        <span class="feature-text">Join a community of Nigerian developers</span>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard →</a>
      </div>
      <p class="text">If you have any questions, reply to this email or contact us at support@devadtech.academy.</p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
      <p class="footer-text">Port Harcourt, Nigeria</p>
    </div>
  </div>
</body>
</html>
`;

export default welcomeTemplate;