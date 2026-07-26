// @ts-nocheck
import { trimText, toText, toInt, toJson, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { supplierColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

export const suppliers = buildSingleSheetModule({
  sheetName: 'Suppliers',
  fileName: 'suppliers.xlsx',
  columns: supplierColumns,
  exportAll: async (db) => {
    const rows = await db.Suppliers.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: 'asc' },
    });

    return rows.map((item) => ({
      id: item.id,
      contact_person: item.contact_person || '',
      email: item.email || '',
      phone: item.phone || '',
      name: item.name || '',
      location_data: JSON.stringify(item.location_data) || '',
      logo_url: item.logo_url || '',
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const id = toInt(values[0]);
    const contact_person = toText(values[1]);
    const email = toText(values[2]);
    const phone = toText(values[3]);
    const name = toText(values[4]);
    const location_data = toJson(values[5], {});
    const logo_url = toText(values[6]);
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
        location_data: location_data || undefined,
        logo_url: logo_url || undefined,
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