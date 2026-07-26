// @ts-nocheck
import { STOCK_TYPE_REVERSE_MAP } from "../columns.js";
import { stockMovementColumns } from "../columns.js";
import { rowHasOwnData } from "../helpers.js";

const ORDER_STATUS_MAP = {
  Processing: 'Đang xử lý',
  Shipping: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
  Refunded: 'Đã hoàn tiền',
};

const PO_STATUS_MAP = {
  PENDING: 'Đang chờ',
  RECEIVED: 'Đã nhận',
  PARTIALLY_RECEIVED: 'Nhận một phần',
  CANCELLED: 'Đã hủy',
};

const quoteSheetName = (name) => /[^\w]/.test(name) ? `'${name}'` : name;

const formatVariantOption = (product, variant) => {
  if (!variant) return product?.name || 'N/A';
  const attrs = (variant.VariableAttributes || [])
    .map((attr) => `${attr.attributeKey?.name || attr.attribute_key_id}=${attr.value}`)
    .sort()
    .join('; ');
  return attrs ? `${product.name} - ${attrs}` : product.name;
};

export const stockMovements = {
  kind: 'single',
  sheetName: 'Tồn kho',
  fileName: 'ton-kho.xlsx',
  columns: stockMovementColumns,
  templateSheets: async () => [{ name: 'Tồn kho', columns: stockMovementColumns, rows: [] }],
  async exportSheets(db) {
    const stockRows = await db.StockMovements.findMany({
      orderBy: { id: 'asc' },
      include: {
        variant: {
          include: {
            product: { select: { name: true } },
            VariableAttributes: { include: { attributeKey: true } },
          },
        },
      },
    });

    const poIds = [...new Set(stockRows.filter((s) => s.type === 'IN' && s.reference_id != null).map((s) => s.reference_id))];
    const orderIds = [...new Set(stockRows.filter((s) => s.type === 'OUT' && s.reference_id != null).map((s) => s.reference_id))];

    const [orders, purchaseOrders] = await Promise.all([
      orderIds.length ? db.Orders.findMany({ where: { id: { in: orderIds } } }) : [],
      poIds.length ? db.PurchaseOrders.findMany({ where: { id: { in: poIds } } }) : [],
    ]);

    const orderRowMap = new Map();
    const refRows = [];

    orders.forEach((o, idx) => {
      const rowNum = idx + 2;
      orderRowMap.set(o.id, rowNum);
      refRows.push({
        loai: 'Đơn hàng',
        ma: String(o.id),
        trang_thai: ORDER_STATUS_MAP[o.status] || o.status,
        tong_tien: Number(o.total_amount),
        email: o.user_email || '',
        ngay_tao: o.created_at ? o.created_at.toISOString().split('T')[0] : '',
      });
    });

    purchaseOrders.forEach((po, idx) => {
      const rowNum = orders.length + idx + 2;
      orderRowMap.set(po.id, rowNum);
      refRows.push({
        loai: 'Phiếu nhập',
        ma: String(po.id),
        trang_thai: PO_STATUS_MAP[po.status] || po.status,
        tong_tien: Number(po.total_cost),
        email: '',
        ngay_tao: po.order_date ? po.order_date.toISOString().split('T')[0] : '',
      });
    });

    const refColumns = [
      { header: 'Loại', key: 'loai', width: 16 },
      { header: 'Mã', key: 'ma', width: 14 },
      { header: 'Trạng thái', key: 'trang_thai', width: 18 },
      { header: 'Tổng tiền', key: 'tong_tien', width: 14, numFmt: '#,##0' },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Ngày tạo', key: 'ngay_tao', width: 14 },
    ];

    const refSheetName = 'Tham chiếu';

    const stockSheetRows = stockRows.map((item) => {
      const rid = item.reference_id;
      let reference_code = '';
      if (rid != null) {
        const targetRow = orderRowMap.get(rid);
        if (targetRow) {
          reference_code = {
            text: item.type === 'IN' ? `PO#${rid}` : `ORD#${rid}`,
            hyperlink: `#${quoteSheetName(refSheetName)}!B${targetRow}`,
          };
        } else {
          reference_code = `#${rid}`;
        }
      }

      return {
        product_variant: formatVariantOption(item.variant?.product || {}, item.variant),
        type: STOCK_TYPE_REVERSE_MAP[item.type] || item.type,
        quantity_change: Math.abs(Number(item.quantity_change)),
        reference_code,
        reason: item.reason || '',
      };
    });

    return [
      { name: 'Tồn kho', columns: stockMovementColumns, rows: stockSheetRows },
      { name: refSheetName, columns: refColumns, rows: refRows },
    ];
  },
  parseWorkbook(workbook) {
    const ws = workbook.getWorksheet('Tồn kho') || workbook.worksheets[0];
    if (!ws) throw new Error('File Excel không đúng cấu trúc (thiếu sheet "Tồn kho").');
    return [];
  },
  async importRows() {
    return { created: [], updated: [], errors: [] };
  },
};
