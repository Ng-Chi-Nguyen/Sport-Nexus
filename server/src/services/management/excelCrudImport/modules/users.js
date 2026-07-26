// @ts-nocheck
import { trimText, toText, toInt, toBoolean, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { userColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";
import bcrypt from 'bcrypt';

export const users = buildSingleSheetModule({
  sheetName: 'Users',
  fileName: 'users.xlsx',
  columns: userColumns,
  exportAll: async (db) => {
    const rows = await db.Users.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: 'asc' },
      include: { role: true },
    });

    return rows.map((item) => ({
      id: item.id,
      full_name: item.full_name || '',
      email: item.email || '',
      password: '',
      phone_number: item.phone_number || '',
      role_id: item.role_id || item.role?.id || '',
      status: item.status || '',
      is_verified: item.is_verified ? 'Có' : 'Không',
      avatar: item.avatar || '',
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const id = toInt(values[0]);
    const full_name = toText(values[1]);
    const email = toText(values[2]);
    const password = toText(values[3]);
    const phone_number = toText(values[4]);
    const role_id = toInt(values[5]);
    const status = toText(values[6]);
    const is_verified = toBoolean(values[7]);
    const avatar = toText(values[8]);
    const errors = [];

    if (!full_name) errors.push({ field: 'full_name', message: 'Họ tên không được để trống' });
    if (!email) errors.push({ field: 'email', message: 'Email không được để trống' });

    return {
      values,
      rawValues: values,
      id,
      data: {
        full_name: full_name || undefined,
        email: email || undefined,
        password: password || undefined,
        phone_number: phone_number || undefined,
        role_id: role_id || undefined,
        status: status || undefined,
        is_verified: is_verified ?? undefined,
        avatar: avatar || undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }
    if (row.id) {
      const record = await db.Users.update({ where: { id: row.id }, data });
      return { action: 'update', record };
    }
    const record = await db.Users.create({ data });
    return { action: 'create', record };
  },
});