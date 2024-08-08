import crypto from "crypto";
export const createOrderHash = (total_amount, transaction_uuid, deleveryCharge) => {
    const data = `total_amount=${total_amount + deleveryCharge},transaction_uuid=${transaction_uuid},product_code=EPAYTEST`;
    console.log(total_amount + deleveryCharge);
    const hash = crypto
        .createHmac("sha256", "8gBm/:&EnhH.1/q")
        .update(data)
        .digest("base64");
    return hash;
};
