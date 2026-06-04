import axiosClient from "@/lib/axiosClient";

const LoaderStock = {
  getAllStocks: (page = 1) => {
    // console.log(page);
    const url = `management/stock?page=${page}`;
    const response = axiosClient.get(url);
    return response;
  },
};

export default LoaderStock;
