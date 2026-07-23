import { SIDEBAR_MENU_STRUCTURE } from "@/constants/menu";
import * as Icons from "lucide-react";

const prefix_path = "/management";

export const iconMap = {
  LayoutDashboard: <Icons.LayoutDashboard strokeWidth={1.5} size={18} />,
  ClipboardClock: <Icons.ClipboardClock strokeWidth={1.5} size={18} />,
  ClipboardList: <Icons.ClipboardList strokeWidth={1.5} size={18} />,
  ShoppingCart: <Icons.ShoppingCart strokeWidth={1.5} size={18} />,
  Barcode: <Icons.Barcode strokeWidth={1.5} size={18} />,
  Star: <Icons.Star strokeWidth={1.5} size={18} />,
  ListTree: <Icons.ListTree strokeWidth={1.5} size={18} />,
  Package: <Icons.Package strokeWidth={1.5} size={18} />,
  ChartColumnStacked: <Icons.ChartColumnStacked strokeWidth={1.5} size={18} />,
  Tag: <Icons.Tag strokeWidth={1.5} size={18} />,
  Award: <Icons.Award strokeWidth={1.5} size={18} />,
  Warehouse: <Icons.Warehouse strokeWidth={1.5} size={18} />,
  ArchiveRestore: <Icons.ArchiveRestore strokeWidth={1.5} size={18} />,
  Import: <Icons.Import strokeWidth={1.5} size={18} />,
  IdCard: <Icons.IdCard strokeWidth={1.5} size={18} />,
  KeySquare: <Icons.KeySquare strokeWidth={1.5} size={18} />,
  LocateFixed: <Icons.LocateFixed strokeWidth={1.5} size={18} />,
  Tags: <Icons.Tags strokeWidth={1.5} size={18} />,
};

export const getSidebarSections = () => {
  const rawStructure = SIDEBAR_MENU_STRUCTURE(prefix_path);
  return rawStructure.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      icon: iconMap[item.iconName] || <Icons.HelpCircle size={18} />,
    })),
  }));
};

export const mainNavItems = () => {
  const sections = getSidebarSections();
  return sections.flatMap((s) => s.items);
};