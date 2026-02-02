interface EmailTemplateProps {
  appName: string;
  code: string;
  name: string;
  subject: string;
  type: 'verify' | 'reset';
}

export const authTemplate = ({
  appName,
  code,
  name,
  subject,
  type,
}: EmailTemplateProps) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${subject}</title>
  <style>
 
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${subject}</h1>
    </div>
    <div class="email-body">
      <h2>Hello ${name},</h2>
      <p>${
        type === 'verify'
          ? `Thanks for joining <b>${appName}</b>! Please verify your email.`
          : `We received a request to reset your password. Use the code below to proceed.`
      }
      </p>
      <div class="otp-box">${code}</div>
      ${
        type === 'verify'
          ? `
        <p style="text-align:center;">
          <a href="#" class="activation-button">Verify Account</a>
        </p>`
          : ''
      }
    </div>
  </div>
</body>
</html>
`;
