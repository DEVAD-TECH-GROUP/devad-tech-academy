const liveClassReminderTemplate = ({
  firstName,
  className,
  instructorName,
  scheduledAt,
  joinUrl,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #0F0F14; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #16161F; border: 1px solid #2A2A3A; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d1238, #163060); padding: 40px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #60A5FA; }
    .body { padding: 40px 30px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; }
    .class-box { background: #1E1E2A; border: 1px solid #60A5FA44; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .class-title { font-size: 18px; font-weight: 700; color: #60A5FA; margin-bottom: 8px; }
    .class-detail { font-size: 13px; color: #9999B8; margin-bottom: 4px; }
    .live-badge { display: inline-block; background: #F87171; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
    .btn { display: inline-block; background: #60A5FA; color: #0F0F14; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px; }
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
      <div class="title">Live Class Starting Soon 🎥</div>
      <p class="text">Hi ${firstName}, your live class is starting in 30 minutes. Get ready!</p>
      <div class="class-box">
        <div class="live-badge">🔴 LIVE</div>
        <div class="class-title">${className}</div>
        <div class="class-detail">👨‍🏫 Instructor: ${instructorName}</div>
        <div class="class-detail">📅 Time: ${scheduledAt}</div>
      </div>
      <div style="text-align: center;">
        <a href="${joinUrl}" class="btn">Join Live Class →</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default liveClassReminderTemplate;