
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const instructorApprovedTemplate = ({
  firstName,
  setPasswordUrl,
  loginUrl,
}) => {
  const safeFirstName = escapeHtml(firstName);
  const safeSetPasswordUrl = escapeHtml(setPasswordUrl);
  const safeLoginUrl = escapeHtml(loginUrl);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Instructor Application Approved</title>

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
      text-align: center;
    }

    .icon {
      font-size: 64px;
      margin-bottom: 16px;
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
      text-align: left;
    }

    .feature {
      padding: 12px 0;
      border-bottom: 1px solid #2A2A3A;
      text-align: left;
    }

    .feature-icon {
      font-size: 20px;
      margin-right: 12px;
    }

    .feature-text {
      font-size: 14px;
      color: #9999B8;
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
      margin-top: 20px;
    }

    .notice {
      background: #1E1E2A;
      border-left: 4px solid #818CF8;
      border-radius: 4px;
      padding: 16px;
      margin: 24px 0;
      font-size: 13px;
      color: #9999B8;
      line-height: 1.7;
      text-align: left;
    }

    .secondary-link {
      display: inline-block;
      color: #818CF8 !important;
      font-size: 14px;
      margin-top: 12px;
      text-decoration: none;
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

      <div class="icon">🎓</div>

      <div class="title">
        You're Approved as an Instructor!
      </div>

      <p class="text">
        Congratulations ${safeFirstName}!
        Your instructor application has been approved.

        You can now start creating courses and teaching
        on Devad Tech Academy.
      </p>

      <div class="feature">
        <span class="feature-icon">📚</span>
        <span class="feature-text">
          Create and publish unlimited courses
        </span>
      </div>

      <div class="feature">
        <span class="feature-icon">💰</span>
        <span class="feature-text">
          Earn 70% revenue from your courses
        </span>
      </div>

      <div class="feature">
        <span class="feature-icon">🎥</span>
        <span class="feature-text">
          Host live classes with Daily.co
        </span>
      </div>

      <div class="feature">
        <span class="feature-icon">🤖</span>
        <span class="feature-text">
          Use AI tools to create content faster
        </span>
      </div>

      <p class="text" style="margin-top: 28px;">
        Your instructor account is ready!

        Before accessing your instructor dashboard,
        you need to create your account password.
      </p>

      <a
        href="${safeSetPasswordUrl}"
        class="btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        Set Your Password →
      </a>

      <div class="notice">
        <strong style="color: #E8E8F0;">
          Important Security Notice
        </strong>

        <br>

        This password setup link is valid for 7 days
        and can only be used once.

        Do not share this link with anyone.
      </div>

      <p class="text" style="text-align: center;">
        Already have your password?
      </p>

      <a
        href="${safeLoginUrl}"
        class="secondary-link"
      >
        Log in to your account →
      </a>

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

export default instructorApprovedTemplate;
