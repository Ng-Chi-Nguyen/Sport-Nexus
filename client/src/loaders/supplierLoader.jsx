import axiosClient from "@/api/axiosClient";

const LoaderSupplier = {
  getAllSupplier: (page = 1) => {
    // console.log(page);
    const url = `management/supplier?page=${page}`;
    const response = axiosClient.get(url);
    return response;
  },

  getSupplierById: ({ params }) => {
    const { supplierId } = params;
    const url = `management/supplier/${supplierId}`;
    const response = axiosClient.get(url);
    return response;
  },
};

export default LoaderSupplier;
