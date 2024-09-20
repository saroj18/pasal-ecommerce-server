export const orderPlacedEmailContent = (username, orderId, productInfo, totalPrice) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
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
      color: #2c3e50;
    }
    p {
      font-size: 16px;
      color: #34495e;
    }
    .order-details {
      margin-top: 20px;
    }
    .order-details table {
      width: 100%;
      border-collapse: collapse;
    }
    .order-details th, .order-details td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .order-details th {
      background-color: #2ecc71;
      color: white;
    }
    .order-details td {
      background-color: #ecf0f1;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #95a5a6;
    }
    .footer a {
      color: #2ecc71;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Thank you for your order!</h2>
    <p>Hi ${username},</p>
    <p>Your order <strong>#${orderId}</strong> has been successfully placed. Below are your order details:</p>
    
    <div class="order-details">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Brand</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
        ${productInfo
        .map((ele) => {
        return `<tr>
            <td title=${ele.name}>${ele.name}</td>
            <td>${ele.brand}</td>
            <td>${ele.price}</td>
          </tr>`;
    })
        .join("")}
         
        </tbody>
      </table>
    </div>

    <p>Total Amount: <strong>Rs${totalPrice}</strong></p>

    <p>We will send you another email when your order is shipped. If you have any questions, feel free to reply to this email or visit our <a href="https://pasal-ecommerce-client.vercel.app/">support page</a>.</p>

    <div class="footer">
      <p>&copy; 2024 Pasal. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;
};
