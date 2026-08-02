import codProvider from "./cod.provider.js";
import payosProvider from "./payos.provider.js";
import { isPayosConfigured } from "../../../../configs/payos.config.js";

const providers = {
    cod: codProvider,
    payos: payosProvider,
};

export const getProvider = (method) => {
    const key = String(method || "").toLowerCase();
    return providers[key] || null;
};

export const getAvailablePaymentMethods = () => {
    const methods = [
        { value: "COD", label: "Thanh toán khi nhận hàng", channels: ["COD"] },
    ];
    if (isPayosConfigured()) {
        methods.push(
            {
                value: "BANK_TRANSFER",
                label: "Chuyển khoản ngân hàng (PayOS)",
                channels: ["BANK_TRANSFER"],
            },
            { value: "MOMO", label: "Ví MoMo", channels: ["MOMO"] },
            {
                value: "CREDIT_CARD",
                label: "Thẻ ATM / thẻ quốc tế",
                channels: ["CREDIT_CARD"],
            },
            { value: "VNPAY", label: "VNPay", channels: ["VNPAY"] },
        );
    } else {
        methods.push({
            value: "BANK_TRANSFER",
            label: "Chuyển khoản ngân hàng",
            channels: ["BANK_TRANSFER"],
            manual: true,
        });
    }
    return methods;
};

export const isManualBankTransfer = (method) =>
    method === "BANK_TRANSFER" && !isPayosConfigured();

export default {
    providers,
    getProvider,
    getAvailablePaymentMethods,
    isManualBankTransfer,
};