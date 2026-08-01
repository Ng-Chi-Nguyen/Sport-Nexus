import { PlusCircle, Pencil, Trash2, Package } from "lucide-react";

export const actionConfig = {
  CREATE: { icon: PlusCircle, color: "text-emerald-400" },
  UPDATE: { icon: Pencil, color: "text-sky-400" },
  DELETE: { icon: Trash2, color: "text-rose-400" },
  STOCK_ADJUSTMENT: { icon: Package, color: "text-amber-400" },
};

export const actionTypes = [
  { slug: "" },
  { slug: "CREATE" },
  { slug: "UPDATE" },
  { slug: "DELETE" },
  { slug: "STOCK_ADJUSTMENT" },
];

export const entityTypes = [
  { slug: "" },
  { slug: "Orders" },
  { slug: "Products" },
  { slug: "Users" },
  { slug: "ProductVariants" },
  { slug: "Coupons" },
  { slug: "Brands" },
  { slug: "Categories" },
  { slug: "Suppliers" },
];

export const statusOptions = [
  { slug: "" },
  { slug: "SUCCESS" },
  { slug: "FAILED" },
];
