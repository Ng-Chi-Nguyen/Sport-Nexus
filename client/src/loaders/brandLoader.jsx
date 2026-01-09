import axiosClient from "@/lib/axiosClient";

const LoaderBrand = {
  getAllBrands: (page = 1) => {
    // console.log(page);
    const url = `management/brand?page=${page}`;
    const response = axiosClient.get(url);
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
