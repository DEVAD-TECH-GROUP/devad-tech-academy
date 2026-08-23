const referralSuccessTemplate = ({
  firstName,
  refereeName,
  creditAmount,
  discountPercent,
  dashboardUrl,
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
    .body { padding: 40px 30px; text-align: center; }
    .icon { font-size: 64px; margin-bottom: 16px; }
    .title { font-size: 24px; font-weight: 700; color: #E8E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; color: #9999B8; line-height: 1.7; margin-bottom: 16px; }
    .reward-box { background: #1E1E2A; border: 1px solid #34D39944; border-radius: 12px; padding: 24px; margin: 20px 0; display: flex; justify-content: space-around; }
    .reward-item { text-align: center; }
    .reward-value { font-size: 28px; font-weight: 800; color: #34D399; }
    .reward-label { font-size: 12px; color: #9999B8; margin-top: 4px; }
    .btn { display: inline-block; background: #34D399; color: #0F0F14; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px; }
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
      <div class="icon">🎉</div>
      <div class="title">Your Referral Joined!</div>
      <p class="text">Great news ${firstName}! <strong style="color: #E8E8F0;">${refereeName}</strong> just joined Devad Tech Academy using your referral link. Here's your reward:</p>
      <div class="reward-box">
        <div class="reward-item">
          <div class="reward-value">₦${creditAmount}</div>
          <div class="reward-label">Credit Earned</div>
        </div>
        <div class="reward-item">
          <div class="reward-value">${discountPercent}%</div>
          <div class="reward-label">Subscription Discount</div>
        </div>
      </div>
      <p class="text">Keep referring and earn up to 50% off your subscription!</p>
      <a href="${dashboardUrl}" class="btn">View Referrals →</a>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default referralSuccessTemplate;