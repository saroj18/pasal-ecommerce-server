export const shopVerifyApproveEmailContent = (
  username: string,
  shopName: string,
  approvalDate: string,
  report:string
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shop Verified</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h2 {
      color: #2ecc71;
    }
    p {
      font-size: 16px;
      color: #34495e;
    }
    .shop-details {
      margin-top: 20px;
    }
    .shop-details table {
      width: 100%;
      border-collapse: collapse;
    }
    .shop-details th, .shop-details td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .shop-details th {
      background-color: #3498db;
      color: white;
    }
    .shop-details td {
      background-color: #ecf0f1;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #2ecc71;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #95a5a6;
    }
    .footer a {
      color: #3498db;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your shop has been approved!</h2>
    <p>Dear ${username},</p>
    <p>We are excited to let you know that your shop <strong>${shopName}</strong> has been approved and is now live on our platform. Here are the details:</p>
    
    <div class="shop-details">
      <table>
        <thead>
          <tr>
            <th>Shop Name</th>
            <th>Owner</th>
            <th>Date Approved</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${shopName}</td>
            <td${username}</td>
            <td>${approvalDate}</td>
            <td>${report}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <a href="https://pasal-ecommerce-client.vercel.app/dashboard" class="button">Go to Dashboard</a>

    <div class="footer">
      <p>&copy; 2024 Pasal. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;
};
