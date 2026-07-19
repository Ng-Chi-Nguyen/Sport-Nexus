import axiosClient from "@/lib/axiosClient";

const LoaderSupplier = {
  getAllSupplier: async ({ page = 1, search = '', province = '' } = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (search) params.set('search', search);
    if (province) params.set('province', province);
    try {
      const response = await axiosClient.get(`management/supplier?${params.toString()}`);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { success: true, data: { supplier: [], pagination: { totalPages: 1, currentPage: 1 } } };
      }
      throw error;
    }
  },

  getSupplierById: ({ params }) => {
    const { supplierId } = params;
    const url = `management/supplier/${supplierId}`;
    const response = axiosClient.get(url);
    return response;
  },

  getSuppliersDropdown: () => {
    const url = `management/supplier/all`;
    const response = axiosClient.get(url);
    return response;
  },

  getDistinctProvinces: async () => {
    const response = await axiosClient.get('management/supplier/provinces');
    return response;
  },
};

export default LoaderSupplier;
