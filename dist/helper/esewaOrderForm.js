var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const esewaOrderForm = (hash, amount, orderId, deleveryCharge) => __awaiter(void 0, void 0, void 0, function* () {
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
});
