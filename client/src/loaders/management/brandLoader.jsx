import axiosClient from "@/lib/axiosClient";

const LoaderBrand = {
  getAllBrands: async ({ page = 1, origin = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (origin) params.set('origin', origin);
    if (search) params.set('search', search);
    try {
      const response = await axiosClient.get(`management/brand?${params.toString()}`);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { success: true, data: { brands: [], pagination: { totalPages: 1, currentPage: 1 } } };
      }
      throw error;
    }
  },

  getBrandById: ({ params }) => {
    const { brandId } = params;
    // console.log(brandId);
    const url = `management/brand/${brandId}`;
    const response = axiosClient.get(url);
    return response;
  },

  getBrandsDropdown: () => {
    // console.log(page);
    const url = `management/brand/all`;
    const response = axiosClient.get(url);
    // console.log(response);
    return response;
  },
};

export default LoaderBrand;
