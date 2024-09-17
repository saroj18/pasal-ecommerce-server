var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const khaltiPaymentVerify = (pidx) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
        method: "POST",
        body: JSON.stringify({
            pidx,
        }),
        headers: {
            "Content-Type": "application/json",
            Authorization: "Key 0c05e393ff924ec2827d3fbe33f013ad",
        },
    });
    const data = yield resp.json();
    return data;
});
