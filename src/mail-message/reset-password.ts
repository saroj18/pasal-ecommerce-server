export const resetPasswordEmailContent = (username: string, link: string) => {
    return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          color: #333;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .container {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }
        h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        p {
          font-size: 16px;
          margin: 10px 0;
          color: #555;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: #00000;
          background-color: #4caf50;
          border: none;
          border-radius: 4px;
          text-decoration: none;
          text-align: center;
        }
        .button:hover {
          background-color: #45a049;
        }
        .footer {
          margin-top: 20px;
          font-size: 14px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Reset Request</h1>
        <p>Hello ${username},</p>
        <p>
          We received a request to reset your password. Click the button below to
          set a new password:
        </p>
        <a href="${link}" class="button">Reset Password</a>
        <p class="footer">
          This mail is expired after 2 minute
        </p>
        <p class="footer">
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    </body>
  </html>
  `;
  };
  