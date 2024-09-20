export const shopVerifyRejectEmailContent = (username, shopName, rejectMsg) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shop Rejected</title>
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
      color: #e74c3c;
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
      background-color: #e74c3c;
      color: white;
    }
    .shop-details td {
      background-color: #ecf0f1;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #e74c3c;
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
      color: #e74c3c;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your shop verification was rejected</h2>
    <p>Dear ${username},</p>
    <p>We regret to inform you that your shop <strong>${shopName}</strong> did not meet our verification requirements. Here are the details:</p>
    
    <div class="shop-details">
      <table>
        <thead>
          <tr>
            <th>Shop Name</th>
            <th>Owner</th>
            <th>Rejection Reason</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${shopName}</td>
            <td>${username}</td>
            <td>${rejectMsg}</td>
          </tr>
        </tbody>
      </table>
    </div>

  

    <div class="footer">
      <p>&copy; 2024 Pasal. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;
};
