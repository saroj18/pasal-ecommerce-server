import fetch from "node-fetch";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { esewaStatusInfo } from "../helper/esewaStatusInfo.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../model/payment-model.js";
import { Order } from "../model/order.model.js";

const paymentInfo = {
  amount: "100",
  failure_url: "https://google.com",
  product_delivery_charge: "0",
  product_service_charge: "0",
  product_code: "EPAYTEST",
  signature: "YVweM7CgAtZW5tRKica/BIeYFvpSj09AaInsulqNKHk=",
  signed_field_names: "total_amount,transaction_uuid,product_code",
  success_url: "https://esewa.com.np",
  tax_amount: "10",
  total_amount: "110",
  transaction_uuid: "ab14a8f2b02c3",
};

export const esewaStatusCheck = asyncHandler(async (req, resp) => {
  const { token } = req.body;
  const { _id } = req.user;
  console.log("finalToken", token);

  if (!token) {
    throw new Error("token is required");
  }

  let decodeToken: { [key: string]: string } = JSON.parse(
    Buffer.from(token, "base64").toString("utf-8")
  );

  const getStatusInfo = await esewaStatusInfo(decodeToken);
  console.log("ttt", getStatusInfo);

  if (getStatusInfo.status != "COMPLETE") {
    resp
      .status(500)
      .json(new ApiResponse("failed to verify payment", 500, getStatusInfo));
    return;
  }

  const productOrder = await Order.findByIdAndUpdate(
    getStatusInfo.transaction_uuid,
    {
      set: {
        paymentStatus: "complete",
      },
    }
  );
  await Payment.create({
    product: productOrder?.product,
    productPrice: getStatusInfo.total_amount,
    status: "COMPLETE",
    payVia: productOrder?.payMethod,
    payBy: productOrder?.purchaseBy,
    ref_id: getStatusInfo.ref_id,
  });
  resp.status(200).json(new ApiResponse("", 200, null));
});
