// @ts-nocheck
import { trimText, toText, toInt, toBoolean, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { userColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";
import bcrypt from 'bcrypt';

const STATUS_OPTIONS = ['Hoạt động', 'Vô hiệu'];
const VERIFIED_OPTIONS = ['Có', 'Không'];
const ROLE_LABELS = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
};

const normalizeText = (value) => trimText(value).toLowerCase().replace(/\s+/g, ' ');

const resolveRoleLabel = (role) => {
  if (!role) return '';
  return ROLE_LABELS[role.slug] || role.name || '';
};

const resolveRoleMatch = (value) => {
  const normalized = normalizeText(value);
  return Object.entries(ROLE_LABELS).find(([, label]) => normalizeText(label) === normalized)?.[0] || null;
};

export const users = buildSingleSheetModule({
  sheetName: 'Người dùng',
  fileName: 'nguoi-dung.xlsx',
  columns: userColumns,
  templateSheets: async (db) => {
    const roles = await db.Roles.findMany({ select: { slug: true, name: true } });
    const roleNames = roles.map((role) => resolveRoleLabel(role)).filter(Boolean);
    const columnsWithValidation = userColumns.map(col => {
      if (col.key === 'role_name') {
        return { ...col, validation: { type: 'list', allowBlank: true, formulae: [`"${roleNames.join(',')}"`] } };
      }
      if (col.key === 'status') {
        return { ...col, validation: { type: 'list', allowBlank: true, formulae: [`"${STATUS_OPTIONS.join(',')}"`] } };
      }
      if (col.key === 'is_verified') {
        return { ...col, validation: { type: 'list', allowBlank: true, formulae: [`"${VERIFIED_OPTIONS.join(',')}"`] } };
      }
      return col;
    });
    return [{ name: 'Người dùng', columns: columnsWithValidation, rows: [] }];
  },
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
      role_name: resolveRoleLabel(item.role),
      status: item.status ? 'Hoạt động' : 'Vô hiệu',
      is_verified: item.is_verified ? 'Có' : 'Không',
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const full_name = toText(values[0]);
    const email = toText(values[1]);
    const password = toText(values[2]);
    const phone_number = toText(values[3]);
    const role_name = toText(values[4]);
    const status = toText(values[5]);
    const is_verified = toBoolean(values[6]);
    const errors = [];

    if (!full_name) errors.push({ field: 'full_name', message: 'Họ tên không được để trống' });
    if (!email) errors.push({ field: 'email', message: 'Email không được để trống' });

    return {
      values,
      rawValues: values,
      data: {
        full_name: full_name || undefined,
        email: email || undefined,
        password: password || undefined,
        phone_number: phone_number || undefined,
        role_name: role_name || undefined,
        status: status || undefined,
        is_verified: is_verified ?? undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = { ...row.data };
    delete data.role_name;

    if (row.data.role_name) {
      const matchedSlug = resolveRoleMatch(row.data.role_name);
      const role = matchedSlug
        ? await db.Roles.findFirst({ where: { slug: matchedSlug } })
        : await db.Roles.findFirst({ where: { OR: [{ name: row.data.role_name }, { slug: normalizeText(row.data.role_name) }] } });
      if (role) {
        data.role_id = role.id;
      } else {
        return { action: 'error', errors: [{ field: 'role_name', message: `Vai trò "${row.data.role_name}" không tồn tại` }] };
      }
    }

    if (row.data.status === 'Hoạt động') data.status = true;
    else if (row.data.status === 'Vô hiệu') data.status = false;
    else delete data.status;

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    const record = await db.Users.create({ data });
    return { action: 'create', record };
  },
});
