const quizReminderTemplate = ({
  firstName,
  quizTitle,
  courseName,
  availableUntil,
  quizUrl,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #0F0F14; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #16161F; border: 1px solid #2A2A3A; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #120d1f, #301638); padding: 40px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #C084FC; }
    .body { padding: 40px 30px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; }
    .quiz-box { background: #1E1E2A; border: 1px solid #C084FC44; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .quiz-title { font-size: 18px; font-weight: 700; color: #C084FC; margin-bottom: 8px; }
    .quiz-detail { font-size: 13px; color: #9999B8; margin-bottom: 4px; }
    .btn { display: inline-block; background: #C084FC; color: #0F0F14; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px; }
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
      <div class="title">Quiz Available 🧪</div>
      <p class="text">Hi ${firstName}, a quiz is now available for you to take. Don't wait too long!</p>
      <div class="quiz-box">
        <div class="quiz-title">${quizTitle}</div>
        <div class="quiz-detail">📚 Course: ${courseName}</div>
        <div class="quiz-detail">⏰ Available Until: ${availableUntil}</div>
      </div>
      <div style="text-align: center;">
        <a href="${quizUrl}" class="btn">Take Quiz →</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default quizReminderTemplate;