import axiosClient from "@/lib/axiosClient";

const LoaderBrand = {
  getAllBrands: ({ page = 1, origin = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (origin) params.set('origin', origin);
    if (search) params.set('search', search);
    const response = axiosClient.get(`management/brand?${params.toString()}`);
    return response;
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
