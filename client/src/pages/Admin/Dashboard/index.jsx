import { useLoaderData } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FilterBar } from "./components/FilterBar";
import { TabNav } from "./components/TabNav";
import { BusinessOverview } from "./business";

const BREADCRUMBS = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản trị", route: "" },
  { title: "Dashboard tổng quan", route: "#" },
];

const SECTIONS = {
  business: BusinessOverview,
};

const Dashboard = () => {
  const loaderData = useLoaderData();
  const db = loaderData?.data?.data || loaderData?.data || {};

  const params = new URLSearchParams(window.location.search);
  const activeTab = params.get("tab") || "business";
  const SectionComponent = SECTIONS[activeTab];

  return (
    <div className="space-y-4">
      <Breadcrumbs data={BREADCRUMBS} />
      <FilterBar meta={db.meta} />
      <TabNav />
      {SectionComponent ? (
        <SectionComponent data={db} />
      ) : (
        <p className="text-center text-sm text-slate-500">Chưa có dữ liệu</p>
      )}
    </div>
  );
};

export default Dashboard;
