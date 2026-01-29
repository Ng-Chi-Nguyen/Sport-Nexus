import axiosClient from "@/lib/axiosClient";

const LoaderOrder = {
  getAllOrders: (page = 1) => {
    // console.log(page);
    const url = `customer/order?page=${page}`;
    const response = axiosClient.get(url);
    return response;
  },

  getOrderById: (orderId) => {
    // console.log(orderId);
    const url = `customer/order/${orderId}`;
    const response = axiosClient.get(url);
    return response;
  },
};

export default LoaderOrder;
