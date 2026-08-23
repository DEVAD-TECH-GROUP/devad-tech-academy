const announcementTemplate = ({
  title,
  message,
  ctaText = null,
  ctaUrl = null,
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
    .message { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 24px; white-space: pre-line; }
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
      <div class="title">📢 ${title}</div>
      <div class="message">${message}</div>
      ${ctaText && ctaUrl
        ? `<div style="text-align: center;"><a href="${ctaUrl}" class="btn">${ctaText} →</a></div>`
        : ""
      }
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
      <p class="footer-text">You received this because you're a member of Devad Tech Academy.</p>
    </div>
  </div>
</body>
</html>
`;

export default announcementTemplate;