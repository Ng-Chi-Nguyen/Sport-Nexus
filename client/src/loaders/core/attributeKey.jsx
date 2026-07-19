import axiosClient from "@/lib/axiosClient";

const LoaderAttr = {
  getAllAttrs: async ({ page = 1, search = '', unit = '' } = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (search) params.set('search', search);
    if (unit !== '') params.set('unit', unit);
    try {
      const response = await axiosClient.get(`core/variant-attribute-key?${params.toString()}`);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { success: true, data: { attribute: [], pagination: { totalPages: 1, currentPage: 1 } } };
      }
      throw error;
    }
  },

  getAttrById: (attrId) => {
    const url = `core/variant-attribute-key/${attrId}`;
    const response = axiosClient.get(url);
    return response;
  },

  getAllAttributesDropdown: () => {
    const url = `core/variant-attribute-key/all`;
    const response = axiosClient.get(url);
    return response;
  },

  getDistinctUnits: () => {
    const url = `core/variant-attribute-key/units`;
    return axiosClient.get(url);
  },
};

export default LoaderAttr;
