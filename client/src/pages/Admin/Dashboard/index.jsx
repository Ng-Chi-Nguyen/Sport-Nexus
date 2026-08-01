import { useSearchParams, useLoaderData } from "react-router-dom";
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

  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "business";
  const SectionComponent = SECTIONS[activeTab];

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={BREADCRUMBS} />
      <FilterBar meta={db.meta} />
      <TabNav />
      {SectionComponent ? (
        <SectionComponent data={db} />
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            Chưa có dữ liệu cho mục này
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
