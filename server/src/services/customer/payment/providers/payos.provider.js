import { getPayos } from "../../../../configs/payos.config.js";

const payosProvider = {
    name: "PayOS",

    createPayment: async ({
        order,
        transaction,
        channel,
        returnUrl,
        cancelUrl,
    }) => {
        const payos = getPayos();
        const result = await payos.paymentRequests.create({
            orderCode: transaction.id,
            amount: Math.round(Number(order.final_amount)),
            description: `SportNexus ${transaction.id}`,
            returnUrl,
            cancelUrl,
            buyerEmail: order.user_email || undefined,
        });

        return {
            transactionId: transaction.id,
            status: "Pending",
            checkoutUrl: result.checkoutUrl,
            providerRef: String(result.paymentLinkId),
        };
    },

    confirm: async () => {
        return { status: "Paid" };
    },

    refund: async ({ transaction }) => {
        return {
            status: "Refunded",
            note: "Hoàn tiền thực hiện thủ công trên dashboard PayOS",
        };
    },
};

export default payosProvider;