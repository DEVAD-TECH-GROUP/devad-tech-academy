const assignmentDueTemplate = ({
  firstName,
  assignmentTitle,
  courseName,
  dueDate,
  assignmentUrl,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #0F0F14; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #16161F; border: 1px solid #2A2A3A; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1f1a0d, #3d3016); padding: 40px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #FBBF24; }
    .body { padding: 40px 30px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; }
    .assignment-box { background: #1E1E2A; border: 1px solid #FBBF2444; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .assignment-title { font-size: 18px; font-weight: 700; color: #FBBF24; margin-bottom: 8px; }
    .assignment-detail { font-size: 13px; color: #9999B8; margin-bottom: 4px; }
    .due-date { font-size: 15px; font-weight: 700; color: #F87171; margin-top: 8px; }
    .btn { display: inline-block; background: #FBBF24; color: #0F0F14; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px; }
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
      <div class="title">Assignment Due Soon ⏰</div>
      <p class="text">Hi ${firstName}, you have an upcoming assignment deadline. Don't miss it!</p>
      <div class="assignment-box">
        <div class="assignment-title">${assignmentTitle}</div>
        <div class="assignment-detail">📚 Course: ${courseName}</div>
        <div class="due-date">⏰ Due: ${dueDate}</div>
      </div>
      <div style="text-align: center;">
        <a href="${assignmentUrl}" class="btn">Submit Assignment →</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default assignmentDueTemplate;