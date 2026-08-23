const payoutProcessedTemplate = ({
  firstName,
  amount,
  netAmount,
  platformFee,
  periodStart,
  periodEnd,
  bankName,
  accountNumber,
  reference,
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
    .payout-box { background: #1E1E2A; border: 1px solid #2A2A3A; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .payout-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2A2A3A; font-size: 14px; }
    .payout-label { color: #9999B8; }
    .payout-value { color: #E8E8F0; font-weight: 600; }
    .payout-total { display: flex; justify-content: space-between; padding: 14px 0; }
    .total-label { color: #E8E8F0; font-weight: 700; font-size: 16px; }
    .total-value { color: #34D399; font-size: 22px; font-weight: 800; }
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
      <div class="title">Payout Processed 💰</div>
      <p class="text">Hi ${firstName}, your instructor payout has been processed and sent to your bank account.</p>
      <div class="payout-box">
        <div class="payout-row">
          <span class="payout-label">Reference</span>
          <span class="payout-value">${reference}</span>
        </div>
        <div class="payout-row">
          <span class="payout-label">Period</span>
          <span class="payout-value">${periodStart} — ${periodEnd}</span>
        </div>
        <div class="payout-row">
          <span class="payout-label">Gross Revenue</span>
          <span class="payout-value">${amount}</span>
        </div>
        <div class="payout-row">
          <span class="payout-label">Platform Fee (30%)</span>
          <span class="payout-value">- ${platformFee}</span>
        </div>
        <div class="payout-row">
          <span class="payout-label">Bank</span>
          <span class="payout-value">${bankName}</span>
        </div>
        <div class="payout-row">
          <span class="payout-label">Account</span>
          <span class="payout-value">****${accountNumber.slice(-4)}</span>
        </div>
        <div class="payout-total">
          <span class="total-label">Amount Sent</span>
          <span class="total-value">${netAmount}</span>
        </div>
      </div>
      <p class="text">Please allow 1-3 business days for the funds to reflect in your account. Contact support if you have any issues.</p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default payoutProcessedTemplate;