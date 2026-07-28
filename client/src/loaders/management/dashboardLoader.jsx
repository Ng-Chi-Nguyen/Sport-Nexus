import { queryClient } from "@/lib/react-query";
import dashboardApi from "@/api/management/dashboardApi";

const getSearchParam = (request, key) => new URL(request.url).searchParams.get(key) || "";

const LoaderDashboard = {
  getBusinessOverview: async (params = {}) => {
    return queryClient.fetchQuery({
      queryKey: [
        "management-dashboard-business-overview",
        params.from || "",
        params.to || "",
        params.group_by || "",
        params.revenue_from || "",
        params.revenue_to || "",
        params.trend_from || "",
        params.trend_to || "",
        params.payment_from || "",
        params.payment_to || "",
      ],
      queryFn: () => dashboardApi.getBusinessOverview(params),
    });
  },

  fromRequest: async ({ request }) => {
    const params = {
      from: getSearchParam(request, "from"),
      to: getSearchParam(request, "to"),
      group_by: getSearchParam(request, "group_by"),
      revenue_from: getSearchParam(request, "revenue_from"),
      revenue_to: getSearchParam(request, "revenue_to"),
      trend_from: getSearchParam(request, "trend_from"),
      trend_to: getSearchParam(request, "trend_to"),
      payment_from: getSearchParam(request, "payment_from"),
      payment_to: getSearchParam(request, "payment_to"),
    };

    return LoaderDashboard.getBusinessOverview(params);
  },
};

export default LoaderDashboard;
