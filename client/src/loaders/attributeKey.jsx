import axiosClient from "@/lib/axiosClient";

const LoaderAttr = {
  getAllAttrs: (page = 1) => {
    // console.log(page);
    const url = `core/variant-attribute-key?page=${page}`;
    const response = axiosClient.get(url);
    return response;
  },

  getAttrById: (attrId) => {
    // console.log(brandId);
    const url = `core/variant-attribute-key/${attrId}`;
    const response = axiosClient.get(url);
    return response;
  },
};

export default LoaderAttr;
