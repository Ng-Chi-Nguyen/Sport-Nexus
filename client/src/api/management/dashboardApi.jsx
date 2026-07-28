import axiosClient from "@/lib/axiosClient";

const dashboardApi = {
  getCustomerOverview: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
    if (params.group_by) searchParams.set("group_by", params.group_by);
    const query = searchParams.toString();
    const url = query
      ? `/management/dashboard/customer-overview?${query}`
      : "/management/dashboard/customer-overview";
    return axiosClient.get(url);
  },

  getBusinessOverview: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
    if (params.group_by) searchParams.set("group_by", params.group_by);
    if (params.revenue_from) searchParams.set("revenue_from", params.revenue_from);
    if (params.revenue_to) searchParams.set("revenue_to", params.revenue_to);
    if (params.trend_from) searchParams.set("trend_from", params.trend_from);
    if (params.trend_to) searchParams.set("trend_to", params.trend_to);
    if (params.payment_from) searchParams.set("payment_from", params.payment_from);
    if (params.payment_to) searchParams.set("payment_to", params.payment_to);

    const query = searchParams.toString();
    const url = query
      ? `/management/dashboard/business-overview?${query}`
      : "/management/dashboard/business-overview";

    return axiosClient.get(url);
  },
};

export default dashboardApi;
