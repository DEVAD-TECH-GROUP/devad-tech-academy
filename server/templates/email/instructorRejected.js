const instructorRejectedTemplate = ({
  firstName,
  reason,
  reapplyUrl,
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
    .body { padding: 40px 30px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; }
    .reason-box { background: #1E1E2A; border-left: 4px solid #F87171; border-radius: 4px; padding: 16px; margin: 20px 0; font-size: 14px; color: #9999B8; }
    .btn { display: inline-block; background: #818CF8; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; }
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
      <div class="title">Instructor Application Update</div>
      <p class="text">Hi ${firstName}, thank you for applying to be an instructor at Devad Tech Academy. After reviewing your application, we're unable to approve it at this time.</p>
      <p class="text"><strong style="color: #E8E8F0;">Reason:</strong></p>
      <div class="reason-box">${reason}</div>
      <p class="text">This doesn't mean you can't apply again. We encourage you to address the feedback above and reapply when you're ready. We'd love to have you on board!</p>
      <a href="${reapplyUrl}" class="btn">Apply Again →</a>
      <p class="text" style="margin-top: 20px;">If you have questions, reply to this email or contact support@devadtech.academy</p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default instructorRejectedTemplate;