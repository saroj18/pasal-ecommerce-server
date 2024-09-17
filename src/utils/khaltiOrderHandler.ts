import { OrderType } from "../model/order.model.js";
import { Customer } from "../model/user.model.js";

export async function khaltiOrderHandler(
  totalPrice: number,
  user: Customer,
  order: OrderType
) {
  console.log(totalPrice);
  const resp = await fetch(process.env.KHALTI_END_POINT, {
    method: "POST",
    headers: {
      Authorization: "Key 0c05e393ff924ec2827d3fbe33f013ad",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: process.env.KHALTI_CALLBACK_URL,
      website_url: process.env.BACKEND_ORIGIN,
      amount: totalPrice * 10,
      purchase_order_id: order._id,
      purchase_order_name: user.fullname,
      customer_info: {
        name: user.fullname,
        email: user.email,
        phone: user.mobile,
      },
    }),
  });
  const data = await resp.json();
  data.method = "khalti";
  return data;
}
