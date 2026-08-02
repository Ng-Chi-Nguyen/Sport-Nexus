import crypto from "crypto";

const SECURE_TOKEN = process.env.CASSO_SECURE_TOKEN;

export const isCassoConfigured = () => !!SECURE_TOKEN;

export const getCassoConfig = () => {
    if (!SECURE_TOKEN) {
        const err = new Error("Webhook Casso chưa được cấu hình.");
        err.code = "CASSO_NOT_CONFIGURED";
        throw err;
    }
    return { secureToken: SECURE_TOKEN };
};

const sortObjDataByKey = (data) => {
    const sorted = {};
    Object.keys(data)
        .sort()
        .forEach((key) => {
            sorted[key] =
                data[key] && typeof data[key] === "object" && !Array.isArray(data[key])
                    ? sortObjDataByKey(data[key])
                    : data[key];
        });
    return sorted;
};

export const verifyCassoSignature = (headers, data, secureToken) => {
    const received = headers["x-casso-signature"] || headers["X-Casso-Signature"];
    if (!received) return false;
    const match = received.match(/t=(\d+),v1=([a-f0-9]+)/);
    if (!match) return false;
    const [, timestamp, signature] = match;
    const sorted = sortObjDataByKey(data);
    const messageToSign = `${timestamp}.${JSON.stringify(sorted)}`;
    const generated = crypto
        .createHmac("sha512", secureToken)
        .update(messageToSign)
        .digest("hex");
    return signature === generated;
};

export default {
    isCassoConfigured,
    getCassoConfig,
    verifyCassoSignature,
};
