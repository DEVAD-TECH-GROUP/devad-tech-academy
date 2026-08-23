const paymentFailedTemplate = ({ firstName, amount, retryUrl }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #0F0F14; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #16161F; border: 1px solid #2A2A3A; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1f0d0d, #3d1616); padding: 40px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #F87171; }
    .body { padding: 40px 30px; text-align: center; }
    .icon { font-size: 64px; margin-bottom: 16px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; }
    .amount { font-size: 28px; font-weight: 800; color: #F87171; margin: 16px 0; }
    .btn { display: inline-block; background: #F87171; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; }
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
      <div class="icon">❌</div>
      <div class="title">Payment Failed</div>
      <p class="text">Hi ${firstName}, unfortunately your payment of</p>
      <div class="amount">${amount}</div>
      <p class="text">could not be processed. This could be due to insufficient funds, card issues, or network problems. Please try again.</p>
      <a href="${retryUrl}" class="btn">Retry Payment →</a>
      <p class="text" style="margin-top: 20px;">If the problem persists, contact us at support@devadtech.academy</p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default paymentFailedTemplate;