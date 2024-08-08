export const esewaOrderForm = async (
  hash: string,
  amount: number,
  orderId: string,
  deleveryCharge: number
) => {
  const formDataEntries = {
    amount: amount,
    tax_amount: "0",
    total_amount: amount + deleveryCharge,
    transaction_uuid: orderId.toString(),
    product_code: "EPAYTEST",
    product_service_charge: "0",
    product_delivery_charge: deleveryCharge,
    success_url: "http://localhost:5171",
    failure_url: "http://localhost:5171",
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: hash,
    secret: "8gBm/:&EnhH.1/q",
  };

  return formDataEntries;
};
