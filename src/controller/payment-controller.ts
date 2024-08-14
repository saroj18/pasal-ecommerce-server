import fetch from "node-fetch";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { esewaStatusInfo } from "../helper/esewaStatusInfo.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../model/payment-model.js";
import { Order } from "../model/order.model.js";
import { ApiError } from "../utils/ApiError.js";

export const esewaStatusCheck = asyncHandler(async (req, resp) => {
  const { token } = req.body;
  // const { _id } = req.user;
  console.log("finalToken", token);

  if (!token) {
    throw new Error("token is required");
  }

  let decodeToken: { [key: string]: string } = JSON.parse(
    Buffer.from(token, "base64").toString("utf-8")
  );
  console.log("ss", decodeToken);

  const getStatusInfo = await esewaStatusInfo(decodeToken);
  console.log("ttt", getStatusInfo);

  if (getStatusInfo.status != "COMPLETE") {
    // await Order.findByIdAndDelete(getStatusInfo.transaction_uuid);
    throw new ApiError("your order was not created");
  }

  const productOrder = await Order.findByIdAndUpdate(
    getStatusInfo.transaction_uuid,
    {
      $set: {
        paymentStatus: "complete",
        orderComplete: true,
      },
    },
    {
      new: true,
    }
  );
  console.log("soraa>>>", productOrder);
  if (!productOrder) {
    throw new ApiError("there is no any orders");
  }
  await Payment.create({
    order: productOrder._id,
    status: "COMPLETE",
    ref_id: getStatusInfo.ref_id,
  });
  resp.status(200).json(new ApiResponse("", 200, null));
});
