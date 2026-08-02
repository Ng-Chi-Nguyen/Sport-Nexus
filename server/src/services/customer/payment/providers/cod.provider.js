const codProvider = {
    name: "COD",

    createPayment: async ({ order, transaction }) => {
        return {
            transactionId: transaction.id,
            status: "Pending",
            instructions: "Bạn sẽ thanh toán khi nhận hàng.",
            checkoutUrl: null,
        };
    },

    confirm: async () => {
        return { status: "Paid" };
    },

    refund: async () => {
        return { status: "Refunded" };
    },
};

export default codProvider;