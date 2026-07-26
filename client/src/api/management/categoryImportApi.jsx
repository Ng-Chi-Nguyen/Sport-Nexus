import axiosClient from "@/lib/axiosClient";

const categoryImportApi = {
  preview: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/management/category/import/preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  import: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/management/category/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  export: () => {
    return axiosClient.get("/management/category/export", {
      responseType: "blob",
    });
  },

  downloadTemplate: () => {
    return axiosClient.get("/management/category/template", {
      responseType: "blob",
    });
  },
};

export default categoryImportApi;
