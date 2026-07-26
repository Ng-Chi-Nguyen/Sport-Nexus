import axiosClient from "@/lib/axiosClient";

const normalizeBasePath = (basePath) => basePath.replace(/\/$/, "");

const toFormData = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
};

const excelCrudImportApi = {
  preview: (basePath, file) => {
    const url = `${normalizeBasePath(basePath)}/import/preview`;
    return axiosClient.post(url, toFormData(file), {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  import: (basePath, file) => {
    const url = `${normalizeBasePath(basePath)}/import`;
    return axiosClient.post(url, toFormData(file), {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  export: (basePath) => {
    const url = `${normalizeBasePath(basePath)}/export`;
    return axiosClient.get(url, { responseType: "blob" });
  },

  template: (basePath) => {
    const url = `${normalizeBasePath(basePath)}/template`;
    return axiosClient.get(url, { responseType: "blob" });
  },
};

export default excelCrudImportApi;
