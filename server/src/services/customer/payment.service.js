import prisma from "../../db/prisma.js";
import {
    getProvider,
    getAvailablePaymentMethods,
    isManualBankTransfer,
} from "./payment/providers/index.js";
import qrService from "./payment/qr.service.js";
import {
    getCassoConfig,
    verifyCassoSignature,
    isCassoConfigured,
} from "../../configs/casso.config.js";

const paymentService = {
    getAvailableMethods: () => getAvailablePaymentMethods(),

    getOrderWithUser: async (orderId) => {
        return prisma.orders.findUnique({
            where: { id: Number(orderId) },
            include: { PaymentTransactions: true },
        });
    },

    createTransaction: async ({ orderId, method, channel }) => {
        const order = await prisma.orders.findUnique({
            where: { id: Number(orderId) },
        });
        if (!order) {
            const err = new Error("Không tìm thấy đơn hàng.");
            err.code = "NOT_FOUND";
            throw err;
        }

        const providerName = isManualBankTransfer(method)
            ? "cod"
            : method === "COD"
                ? "cod"
                : "payos";
        const provider = getProvider(providerName);
        if (!provider) {
            const err = new Error("Phương thức thanh toán không khả dụng.");
            err.code = "INVALID_METHOD";
            throw err;
        }

        const transaction = await prisma.paymentTransactions.create({
            data: {
                order_id: Number(orderId),
                method,
                amount: order.final_amount,
                status: "Pending",
            },
        });

        const baseUrl =
            process.env.PAYOS_RETURN_URL || process.env.FRONTEND_URL;
        const returnUrl = `${baseUrl}/thanh-toan/success?orderId=${order.id}&method=${order.payment_method}`;
        const cancelUrl = `${baseUrl}/thanh-toan?orderId=${order.id}`;
        const created = await provider.createPayment({
            order,
            transaction,
            channel,
            returnUrl,
            cancelUrl,
        });

        if (created.providerRef) {
            await prisma.paymentTransactions.update({
                where: { id: transaction.id },
                data: { provider_ref: created.providerRef },
            });
        }

        const manualQr =
            isManualBankTransfer(method)
                ? qrService.buildQrImageUrl({
                    amount: Number(order.final_amount),
                    orderId: order.id,
                })
                : null;

        if (manualQr?.content) {
            await prisma.paymentTransactions.update({
                where: { id: transaction.id },
                data: { transaction_code: manualQr.content },
            });
        }

        return {
            transaction,
            checkoutUrl: created.checkoutUrl || null,
            instructions: created.instructions || null,
            bankAccount:
                isManualBankTransfer(method)
                    ? qrService.getBankAccountInfo()
                    : null,
            qrImageUrl: manualQr?.qrImageUrl || null,
            transferContent: manualQr?.content || null,
        };
    },

    getTransactionById: async (transactionId) => {
        const tx = await prisma.paymentTransactions.findUnique({
            where: { id: Number(transactionId) },
            include: {
                Orders: {
                    select: {
                        id: true,
                        final_amount: true,
                        status: true,
                        user_email: true,
                    },
                },
            },
        });
        if (!tx) {
            const err = new Error("Không tìm thấy giao dịch thanh toán.");
            err.code = "NOT_FOUND";
            throw err;
        }
        return tx;
    },

    getTransactionsByOrder: async (orderId) => {
        return prisma.paymentTransactions.findMany({
            where: { order_id: Number(orderId) },
            orderBy: { created_at: "desc" },
        });
    },

    getAllTransactions: async ({
        page = 1,
        status = "",
        method = "",
        order_id = "",
    } = {}) => {
        const limit = 10;
        const skip = (Math.max(1, Number(page)) - 1) * limit;
        const where = {};
        if (status) where.status = status;
        if (method) where.method = method;
        if (order_id) where.order_id = Number(order_id);

        const [items, total] = await Promise.all([
            prisma.paymentTransactions.findMany({
                where,
                take: limit,
                skip,
                orderBy: { created_at: "desc" },
                include: {
                    Orders: {
                        select: { id: true, final_amount: true, user_email: true },
                    },
                },
            }),
            prisma.paymentTransactions.count({ where }),
        ]);
        return {
            items,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: Number(page),
                itemsPerPage: limit,
            },
        };
    },

    updateTransactionStatus: async (transactionId, newStatus) => {
        const data = { status: newStatus };
        if (newStatus === "Paid") data.paid_at = new Date();
        return prisma.paymentTransactions.update({
            where: { id: Number(transactionId) },
            data,
        });
    },

    confirmTransaction: async (transactionId, { note } = {}) => {
        const tx = await paymentService.getTransactionById(transactionId);
        if (tx.status !== "Pending") {
            const err = new Error("Giao dịch không ở trạng thái chờ thanh toán.");
            err.code = "INVALID_STATE";
            throw err;
        }
        await paymentService.updateTransactionStatus(tx.id, "Paid");
        await prisma.orders.update({
            where: { id: tx.order_id },
            data: { payment_status: "Paid" },
        });
        return paymentService.getTransactionById(tx.id);
    },

    markCodPaid: async (orderId) => {
        const pendingTx = await prisma.paymentTransactions.findFirst({
            where: { order_id: Number(orderId), method: "COD", status: "Pending" },
        });
        if (!pendingTx) return null;
        await paymentService.updateTransactionStatus(pendingTx.id, "Paid");
        await prisma.orders.update({
            where: { id: Number(orderId) },
            data: { payment_status: "Paid" },
        });
        return paymentService.getTransactionById(pendingTx.id);
    },

    cancelTransaction: async (transactionId) => {
        const tx = await paymentService.getTransactionById(transactionId);
        if (tx.status === "Paid") {
            const err = new Error("Không thể hủy giao dịch đã thanh toán.");
            err.code = "INVALID_STATE";
            throw err;
        }
        await paymentService.updateTransactionStatus(tx.id, "Failed");
        return paymentService.getTransactionById(tx.id);
    },

    refundTransaction: async (transactionId) => {
        const tx = await paymentService.getTransactionById(transactionId);
        if (tx.status !== "Paid") {
            const err = new Error("Chỉ giao dịch đã thanh toán mới hoàn tiền được.");
            err.code = "INVALID_STATE";
            throw err;
        }
        const provider = getProvider(tx.method === "COD" ? "cod" : "payos");
        await provider.refund({ transaction: tx });
        await paymentService.updateTransactionStatus(tx.id, "Refunded");
        await prisma.orders.update({
            where: { id: tx.order_id },
            data: { payment_status: "Refunded" },
        });
        return paymentService.getTransactionById(tx.id);
    },

    uploadReceipt: async (
        transactionId,
        { transaction_code, note, fileBuffer },
    ) => {
        const tx = await paymentService.getTransactionById(transactionId);
        if (tx.method !== "BANK_TRANSFER" || tx.status !== "Pending") {
            const err = new Error(
                "Chỉ chuyển khoản thủ công đang chờ mới được nộp biên lai.",
            );
            err.code = "INVALID_STATE";
            throw err;
        }
        let receiptImageUrl = null;
        if (fileBuffer) {
            receiptImageUrl = await qrService.uploadReceiptImage(fileBuffer, tx.id);
        }
        return prisma.paymentTransactions.update({
            where: { id: tx.id },
            data: {
                transaction_code,
                note: note || null,
                receipt_image_url: receiptImageUrl || tx.receipt_image_url,
            },
        });
    },

    handlePayosWebhook: async (webhookData) => {
        const { payos } = await import("../../configs/payos.config.js");
        if (!payos) return null;

        const verified = await payos.webhooks.verify(webhookData);
        const transactionId = Number(verified.orderCode);
        const tx = await prisma.paymentTransactions.findUnique({
            where: { id: transactionId },
        });
        if (!tx || tx.status !== "Pending") return null;

        await paymentService.updateTransactionStatus(tx.id, "Paid");
        await prisma.orders.update({
            where: { id: tx.order_id },
            data: { payment_status: "Paid" },
        });
        return { transactionId: tx.id, orderId: tx.order_id };
    },

    handleCassoWebhook: async ({ headers, body }) => {
        if (!isCassoConfigured()) return { handled: false, reason: "CASSO_NOT_CONFIGURED" };

        const { secureToken } = getCassoConfig();
        if (!verifyCassoSignature(headers, body, secureToken)) {
            const err = new Error("Chữ ký webhook Casso không hợp lệ.");
            err.code = "INVALID_SIGNATURE";
            throw err;
        }

        const record = body?.data;
        if (!record) return { handled: false, reason: "NO_DATA" };
        const description = String(record.description || "").trim();
        const amount = Number(record.amount);
        if (!description || !amount) {
            return { handled: false, reason: "MISSING_FIELD" };
        }

        const tx = await prisma.paymentTransactions.findFirst({
            where: {
                method: "BANK_TRANSFER",
                status: "Pending",
                transaction_code: description,
            },
        });
        if (!tx) return { handled: false, reason: "NOT_FOUND" };
        if (Number(tx.amount) !== amount) {
            return { handled: false, reason: "AMOUNT_MISMATCH" };
        }
        if (tx.provider_ref === String(record.id)) {
            return { handled: true, duplicate: true, transactionId: tx.id };
        }

        await prisma.paymentTransactions.update({
            where: { id: tx.id },
            data: {
                status: "Paid",
                paid_at: new Date(),
                provider_ref: String(record.id),
                note: `Casso: ${record.reference || ""}`.trim(),
            },
        });
        await prisma.orders.update({
            where: { id: tx.order_id },
            data: { payment_status: "Paid" },
        });
        return { handled: true, transactionId: tx.id, orderId: tx.order_id };
    },

    getOrderPaymentStatus: async (orderId) => {
        const order = await prisma.orders.findUnique({
            where: { id: Number(orderId) },
            select: {
                id: true,
                payment_method: true,
                payment_status: true,
                status: true,
            },
        });
        if (!order) {
            const err = new Error("Không tìm thấy đơn hàng.");
            err.code = "NOT_FOUND";
            throw err;
        }
        return order;
    },
};

export default paymentService;