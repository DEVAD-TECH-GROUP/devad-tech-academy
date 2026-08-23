const enrollmentConfirmTemplate = ({
  firstName,
  courseName,
  instructorName,
  courseUrl,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #0F0F14; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #16161F; border: 1px solid #2A2A3A; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d1f0d, #163316); padding: 40px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #34D399; }
    .body { padding: 40px 30px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; }
    .course-box { background: #1E1E2A; border: 1px solid #34D39944; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .course-name { font-size: 18px; font-weight: 700; color: #34D399; margin-bottom: 8px; }
    .course-detail { font-size: 13px; color: #9999B8; margin-bottom: 4px; }
    .btn { display: inline-block; background: #34D399; color: #0F0F14; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px; margin: 10px 0; }
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
      <div class="title">You're Enrolled! 🎉</div>
      <p class="text">Congratulations ${firstName}! You've successfully enrolled in:</p>
      <div class="course-box">
        <div class="course-name">${courseName}</div>
        <div class="course-detail">👨‍🏫 Instructor: ${instructorName}</div>
        <div class="course-detail">📅 Start learning today</div>
      </div>
      <p class="text">You now have full access to all course materials, live classes, assignments, and our student community. Let's build something amazing!</p>
      <div style="text-align: center;">
        <a href="${courseUrl}" class="btn">Start Learning →</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default enrollmentConfirmTemplate;