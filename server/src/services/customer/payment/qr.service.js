import { uploadFileToSupabase } from "../../../utils/imageUpload.utils.js";

const BANK_ACCOUNT_NO = process.env.BANK_ACCOUNT_NO;
const BANK_NAME = process.env.BANK_NAME || "Vietcombank";
const BANK_ID = process.env.BANK_ID || "970436";

const buildVietQRContent = ({ accountNo, bankId, amount, content }) => {
    const payload = [
        ["00", "01"],
        ["01", bankId],
        ["02", accountNo],
        ["03", "TRAVEL"],
        ["04", "QRV1"],
        ["38", "0208QRIBFTTC"],
        ["53", "704"],
        ["54", String(amount)],
        ["55", content || "Thanh toan don hang"],
        ["58", "VN"],
        ["59", "SportNexus"],
    ];
    return payload
        .map(([id, val]) => `${id}${String(val.length).padStart(2, "0")}${val}`)
        .join("");
};

const buildQrUrl = (addInfo, amount) =>
    `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT_NO}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=SportNexus`;

const qrService = {
    getBankAccountInfo: () => ({
        bankName: BANK_NAME,
        bankId: BANK_ID,
        accountNo: BANK_ACCOUNT_NO,
        accountName: "SportNexus",
    }),

    buildQrImageUrl: ({ amount, orderId }) => {
        const content = `SN${orderId}${Date.now().toString().slice(-6)}`;
        if (!BANK_ACCOUNT_NO) {
            return {
                qrImageUrl: null,
                content,
            };
        }
        return {
            qrImageUrl: buildQrUrl(content, amount),
            content,
        };
    },

    uploadReceiptImage: async (fileBuffer, transactionId) => {
        return uploadFileToSupabase(
            fileBuffer,
            "payment_receipts",
            `tx_${transactionId}`,
        );
    },
};

export default qrService;