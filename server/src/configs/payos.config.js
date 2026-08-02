import { PayOS } from "@payos/node";

const CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const API_KEY = process.env.PAYOS_API_KEY;
const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

const payos =
    CLIENT_ID && API_KEY && CHECKSUM_KEY
        ? new PayOS({
            clientId: CLIENT_ID,
            apiKey: API_KEY,
            checksumKey: CHECKSUM_KEY,
        })
        : null;

export const isPayosConfigured = () => !!payos;

export const getPayos = () => {
    if (!payos) {
        const err = new Error("Cổng PayOS chưa được cấu hình.");
        err.code = "PAYOS_NOT_CONFIGURED";
        throw err;
    }
    return payos;
};

export { payos };