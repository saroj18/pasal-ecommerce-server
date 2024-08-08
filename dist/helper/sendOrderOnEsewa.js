var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from "node-fetch";
import FormData from "form-data";
export const sendOrderOnEsewa = (hash, amount, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var formData = new FormData();
        formData.append('amount', amount);
        formData.append('tax_amount', '0');
        formData.append('total_amount', amount);
        formData.append('transaction_uuid', orderId.toString());
        formData.append('product_code', "EPAYTEST");
        formData.append('product_service_charge', '0');
        formData.append('product_delivery_charge', '0');
        formData.append('success_url', 'http://localhost:5171');
        formData.append('failure_url', 'http://localhost:5171');
        formData.append('signed_field_names', 'total_amount,transaction_uuid,product_code');
        formData.append('signature', hash);
        formData.append('secret', '8gBm/:&EnhH.1/q');
        console.log(formData);
        const resp = yield fetch('https://epay.esewa.com.np/api/epay/main/v2/form', {
            method: 'POST',
            body: formData,
        });
        const data = yield resp.json();
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
