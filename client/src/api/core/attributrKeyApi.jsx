import axiosClient from "@/lib/axiosClient";

const attributeKeyApi = {
  create: (data) => {
    const url = "/core/variant-attribute-key";
    return axiosClient.post(url, data);
  },

  update: (attrId, data) => {
    const url = `/core/variant-attribute-key/${attrId}`;
    return axiosClient.put(url, data);
  },

  delete: (attrId) => {
    const url = `/core/variant-attribute-key/${attrId}`;
    return axiosClient.delete(url);
  },
};

export default attributeKeyApi;
