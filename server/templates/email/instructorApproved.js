const instructorApprovedTemplate = ({
  firstName,
  dashboardUrl,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #0F0F14; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #16161F; border: 1px solid #2A2A3A; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1238, #3D3F6E); padding: 40px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #818CF8; }
    .body { padding: 40px 30px; text-align: center; }
    .icon { font-size: 64px; margin-bottom: 16px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; text-align: left; }
    .feature { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #2A2A3A; text-align: left; }
    .feature-icon { font-size: 20px; }
    .feature-text { font-size: 14px; color: #9999B8; }
    .btn { display: inline-block; background: #818CF8; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 20px; }
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
      <div class="icon">🎓</div>
      <div class="title">You're Approved as an Instructor!</div>
      <p class="text">Congratulations ${firstName}! Your instructor application has been approved. You can now start creating courses and teaching on Devad Tech Academy.</p>
      <div class="feature">
        <span class="feature-icon">📚</span>
        <span class="feature-text">Create and publish unlimited courses</span>
      </div>
      <div class="feature">
        <span class="feature-icon">💰</span>
        <span class="feature-text">Earn 70% revenue from your courses</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🎥</span>
        <span class="feature-text">Host live classes with Daily.co</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🤖</span>
        <span class="feature-text">Use AI tools to create content faster</span>
      </div>
      <a href="${dashboardUrl}" class="btn">Go to Instructor Dashboard →</a>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default instructorApprovedTemplate;