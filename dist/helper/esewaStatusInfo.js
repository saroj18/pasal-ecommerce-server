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
export const esewaStatusInfo = (token) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("uuid", token.transaction_uuid);
    console.log("amount", token.total_amount);
    let formattedAmount = token.total_amount
        .replace(/,/g, "")
        .replace(/\.\d+$/, "");
    const resp = yield fetch(`https://uat.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${formattedAmount}&transaction_uuid=${token.transaction_uuid}`);
    const respData = (yield resp.json());
    return respData;
});
