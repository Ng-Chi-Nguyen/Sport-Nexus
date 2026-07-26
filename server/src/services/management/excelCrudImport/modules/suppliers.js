// @ts-nocheck
import { trimText, toText, toInt, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { supplierColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

export const suppliers = buildSingleSheetModule({
  sheetName: 'Nhà cung cấp',
  fileName: 'nha-cung-cap.xlsx',
  columns: supplierColumns,
  exportAll: async (db) => {
    const rows = await db.Suppliers.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: 'asc' },
    });

    const formatAddress = (loc) => {
      if (!loc || typeof loc !== 'object') return '';
      const parts = [loc.detail, loc.ward || loc.district, loc.province].filter(Boolean);
      return parts.join(', ');
    };

    return rows.map((item) => ({
      id: item.id,
      contact_person: item.contact_person || '',
      email: item.email || '',
      phone: item.phone || '',
      name: item.name || '',
      location_data: formatAddress(item.location_data),
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const parseLocationData = (raw) => {
      const text = trimText(raw);
      if (!text) return undefined;
      if (text.startsWith('{'))
        try { return JSON.parse(text); } catch { return undefined; }
      const parts = text.split(', ').map((s) => s.trim()).filter(Boolean);
      if (parts.length === 0) return undefined;
      if (parts.length === 1) return { province: parts[0] };
      if (parts.length === 2) return { ward: parts[0], province: parts[1] };
      return { detail: parts.slice(0, -2).join(', '), ward: parts[parts.length - 2], province: parts[parts.length - 1] };
    };

    const id = toInt(values[0]);
    const contact_person = toText(values[1]);
    const email = toText(values[2]);
    const phone = toText(values[3]);
    const name = toText(values[4]);
    const location_data = parseLocationData(values[5]) ?? {};

    const errors = [];

    if (!contact_person) errors.push({ field: 'contact_person', message: 'Người liên hệ không được để trống' });
    if (!email) errors.push({ field: 'email', message: 'Email không được để trống' });
    if (!phone) errors.push({ field: 'phone', message: 'Số điện thoại không được để trống' });

    return {
      values,
      rawValues: values,
      id,
      data: {
        contact_person: contact_person || undefined,
        email: email || undefined,
        phone: phone || undefined,
        name: name || undefined,
        location_data,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
    if (row.id) {
      const record = await db.Suppliers.update({ where: { id: row.id }, data });
      return { action: 'update', record };
    }
    const record = await db.Suppliers.create({ data });
    return { action: 'create', record };
  },
});