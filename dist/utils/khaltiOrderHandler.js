var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function khaltiOrderHandler(totalPrice, user, order) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(totalPrice);
        const resp = yield fetch(process.env.KHALTI_END_POINT, {
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
        const data = yield resp.json();
        data.method = "khalti";
        return data;
    });
}
