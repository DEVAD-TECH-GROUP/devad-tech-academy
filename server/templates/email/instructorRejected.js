
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const instructorRejectedTemplate = ({
  firstName,
  reason,
  reapplyUrl,
}) => {
  const safeFirstName = escapeHtml(firstName);
  const safeReason = escapeHtml(reason);
  const safeReapplyUrl = escapeHtml(reapplyUrl);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Instructor Application Update</title>

  <style>
    body {
      margin: 0;
      padding: 20px 10px;
      background: #0F0F14;
      font-family: Arial, Helvetica, sans-serif;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #16161F;
      border: 1px solid #2A2A3A;
      border-radius: 12px;
      overflow: hidden;
    }

    .header {
      background: #241B45;
      padding: 40px 30px;
      text-align: center;
    }

    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #818CF8;
    }

    .body {
      padding: 40px 30px;
    }

    .title {
      font-size: 24px;
      font-weight: 700;
      color: #E8E8F0;
      margin-bottom: 16px;
    }

    .text {
      font-size: 15px;
      color: #9999B8;
      line-height: 1.7;
      margin-bottom: 16px;
    }

    .reason-box {
      background: #1E1E2A;
      border-left: 4px solid #F87171;
      border-radius: 4px;
      padding: 16px;
      margin: 20px 0;
      font-size: 14px;
      color: #9999B8;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }

    .btn {
      display: inline-block;
      background: #818CF8;
      color: #FFFFFF !important;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
    }

    .footer {
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #2A2A3A;
    }

    .footer-text {
      font-size: 12px;
      color: #6B6B8A;
    }

    @media only screen and (max-width: 480px) {
      .body {
        padding: 30px 20px;
      }

      .title {
        font-size: 21px;
      }
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <div class="logo">
        ⚡ DEVAD TECH ACADEMY
      </div>
    </div>

    <div class="body">

      <div class="title">
        Instructor Application Update
      </div>

      <p class="text">
        Hi ${safeFirstName},

        Thank you for applying to be an instructor
        at Devad Tech Academy.

        After reviewing your application,
        we're unable to approve it at this time.
      </p>

      <p class="text">
        <strong style="color: #E8E8F0;">
          Reason:
        </strong>
      </p>

      <div class="reason-box">
        ${safeReason}
      </div>

      <p class="text">
        This doesn't mean you can't apply again.

        We encourage you to address the feedback above
        and reapply when you're ready.

        We'd love to have you on board!
      </p>

      <a
        href="${safeReapplyUrl}"
        class="btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        Apply Again →
      </a>

      <p class="text" style="margin-top: 20px;">
        If you have questions, reply to this email
        or contact support@devadtech.academy
      </p>

    </div>

    <div class="footer">
      <p class="footer-text">
        © ${new Date().getFullYear()}
        Devad Tech Academy. All rights reserved.
      </p>
    </div>

  </div>

</body>
</html>
`;
};

export default instructorRejectedTemplate;
