// @ts-nocheck
import { trimText, toText, toInt, toBoolean, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { couponColumns, DISCOUNT_TYPE_REVERSE_MAP, DISCOUNT_TYPE_MAP } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

export const coupons = buildSingleSheetModule({
  sheetName: "Mã giảm giá",
  fileName: "ma-giam-gia.xlsx",
  columns: couponColumns,
  exportAll: async (db) => {
    const rows = await db.Coupons.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: "asc" },
    });

    return rows.map((item) => ({
      code: item.code || "",
      discount_type: DISCOUNT_TYPE_REVERSE_MAP[item.discount_type] || item.discount_type || "",
      discount_value: Number(item.discount_value ?? 0),
      max_discount: Number(item.max_discount ?? 0),
      min_order_value: Number(item.min_order_value ?? 0),
      start_date: item.start_date ? item.start_date.toISOString().split('T')[0] : '',
      end_date: item.end_date ? item.end_date.toISOString().split('T')[0] : '',
      usage_limit: item.usage_limit ?? 0,
      is_active: item.is_active ? 'Có' : 'Không',
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const code = toText(values[0]);
    const discount_type = toText(values[1]);
    const discount_value = toInt(values[2]);
    const max_discount = toInt(values[3]);
    const min_order_value = toInt(values[4]);
    const start_date = toText(values[5]);
    const end_date = toText(values[6]);
    const usage_limit = toInt(values[7]);
    const is_active = toText(values[8]);

    const errors = [];
    if (!code) errors.push({ field: 'code', message: 'Mã code không được để trống' });
    if (!discount_type) errors.push({ field: 'discount_type', message: 'Loại giảm giá không được để trống' });
    if (discount_value === null) errors.push({ field: 'discount_value', message: 'Giá trị giảm không hợp lệ' });
    if (!start_date) errors.push({ field: 'start_date', message: 'Ngày bắt đầu không được để trống' });
    if (!end_date) errors.push({ field: 'end_date', message: 'Ngày kết thúc không được để trống' });

    return {
      values,
      rawValues: values,
      data: {
        code: code || undefined,
        discount_type: DISCOUNT_TYPE_MAP[discount_type] || discount_type || undefined,
        discount_value: discount_value ?? undefined,
        max_discount: max_discount ?? undefined,
        min_order_value: min_order_value ?? undefined,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        usage_limit: usage_limit ?? undefined,
        is_active: toBoolean(is_active),
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
    const record = await db.Coupons.create({ data: { ...data, usage_count: 0 } });
    return { action: "create", record };
  },
});