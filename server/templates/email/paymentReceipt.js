const paymentReceiptTemplate = ({
  firstName,
  invoiceId,
  plan,
  amount,
  date,
  gateway,
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
    .receipt-box { background: #1E1E2A; border: 1px solid #2A2A3A; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2A2A3A; font-size: 14px; }
    .receipt-label { color: #9999B8; }
    .receipt-value { color: #E8E8F0; font-weight: 600; }
    .receipt-total { display: flex; justify-content: space-between; padding: 14px 0; font-size: 16px; font-weight: 700; }
    .total-label { color: #E8E8F0; }
    .total-value { color: #34D399; font-size: 20px; }
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
      <div class="title">Payment Confirmed ✅</div>
      <p class="text">Hi ${firstName}, your payment has been successfully processed. Here's your receipt:</p>
      <div class="receipt-box">
        <div class="receipt-row">
          <span class="receipt-label">Invoice ID</span>
          <span class="receipt-value">${invoiceId}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Plan</span>
          <span class="receipt-value">${plan}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Date</span>
          <span class="receipt-value">${date}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Payment Method</span>
          <span class="receipt-value">${gateway}</span>
        </div>
        <div class="receipt-total">
          <span class="total-label">Total Paid</span>
          <span class="total-value">${amount}</span>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/billing" class="btn">View Receipt →</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Devad Tech Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default paymentReceiptTemplate;