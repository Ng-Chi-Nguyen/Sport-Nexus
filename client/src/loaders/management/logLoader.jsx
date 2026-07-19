import axiosClient from "@/lib/axiosClient";

const LoaderLog = {
  getAllLogs: async ({ page = 1, action_type, entity_type, status, from, to, user_id } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    if (action_type) params.set("action_type", action_type);
    if (entity_type) params.set("entity_type", entity_type);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (user_id) params.set("user_id", user_id);
    try {
      const response = await axiosClient.get(`management/log?${params.toString()}`);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { success: true, data: { data: [], pagination: { totalPages: 1, currentPage: 1 } } };
      }
      throw error;
    }
  },

  getLogById: ({ params }) => {
    const { logId } = params;
    return axiosClient.get(`management/log/${logId}`);
  },
};

export default LoaderLog;
