import { useLoaderData } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FilterBar } from "./components/FilterBar";
import { TabNav } from "./components/TabNav";
import { BusinessOverview } from "./business";
import { CustomerOverview } from "./customers";
import { ProductOverview } from "./products";
import { InventoryOverview } from "./inventory";
import { OrderOverview } from "./orders";
import { CouponOverview } from "./promotions";
import { SupplierOverview } from "./suppliers";
import { ReviewOverview } from "./reviews";
import { SystemOverview } from "./system";

const BREADCRUMBS = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản trị", route: "" },
  { title: "Dashboard tổng quan", route: "#" },
];

const SECTIONS = {
  business: BusinessOverview,
  customers: CustomerOverview,
  products: ProductOverview,
  inventory: InventoryOverview,
  orders: OrderOverview,
  promotions: CouponOverview,
  suppliers: SupplierOverview,
  reviews: ReviewOverview,
  system: SystemOverview,
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
