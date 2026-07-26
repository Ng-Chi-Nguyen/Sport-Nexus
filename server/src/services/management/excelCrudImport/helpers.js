// @ts-nocheck
export const trimText = (value) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join('').trim();
    }
    if (typeof value.text === 'string') {
      return value.text.trim();
    }
    if (value.result !== undefined) {
      return trimText(value.result);
    }
  }
  return String(value).trim();
};

export const toText = (value) => {
  const text = trimText(value);
  return text === '' ? '' : text;
};

export const toInt = (value) => {
  const text = trimText(value);
  if (!text) return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const toNumber = (value) => {
  const text = trimText(value);
  if (!text) return null;
  const parsed = Number(text.replace(/,/g, ''));
  return Number.isNaN(parsed) ? null : parsed;
};

export const toBoolean = (value, defaultValue = null) => {
  const text = trimText(value).toLowerCase();
  if (!text) return defaultValue;
  if (['1', 'true', 'yes', 'y', 'co', 'có', 'hoạt động', 'hoat dong', 'active'].includes(text)) return true;
  if (['0', 'false', 'no', 'n', 'khong', 'không', 'ngừng', 'ngung', 'inactive'].includes(text)) return false;
  return defaultValue;
};

export const toDate = (value) => {
  if (value instanceof Date) return value;
  const text = trimText(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const toJson = (value, fallback = null) => {
  const text = trimText(value);
  if (!text) return fallback;
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const normalizeLookupText = (value) => trimText(value).toLowerCase().replace(/\s+/g, ' ');

export const parseVariantAttributePairs = (value) => {
  const text = trimText(value);
  if (!text) return [];

  return text
    .split(/[;|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf('=') >= 0 ? part.indexOf('=') : part.indexOf(':');
      if (separatorIndex < 0) return null;
      const key = normalizeLookupText(part.slice(0, separatorIndex));
      const valueText = normalizeLookupText(part.slice(separatorIndex + 1));
      if (!key || !valueText) return null;
      return { key, value: valueText };
    })
    .filter(Boolean);
};

export const buildVariantAttributeSignature = (pairs) => pairs
  .map(({ key, value }) => `${key}=${value}`)
  .filter(Boolean)
  .sort()
  .join(';');

export const buildVariantAttributeLabel = (attributes = []) => attributes
  .map((attr) => {
    const key = normalizeLookupText(attr.attributeKey?.name ?? attr.attribute_key_id);
    const value = normalizeLookupText(attr.value);
    return key && value ? `${key}=${value}` : '';
  })
  .filter(Boolean)
  .sort()
  .join('; ');

export const resolveProductVariant = (products, productName, variantAttributesText) => {
  const targetName = normalizeLookupText(productName);
  if (!targetName) {
    return { error: 'Tên sản phẩm không được để trống' };
  }

  const matchedProducts = products.filter((product) => normalizeLookupText(product.name) === targetName);
  if (matchedProducts.length === 0) {
    return { error: `Không tìm thấy sản phẩm "${productName}"` };
  }
  if (matchedProducts.length > 1) {
    return { error: `Tên sản phẩm "${productName}" bị trùng, không thể xác định biến thể` };
  }

  const product = matchedProducts[0];
  const targetSignature = buildVariantAttributeSignature(parseVariantAttributePairs(variantAttributesText));
  const variants = (product.ProductVariants || []).map((variant) => ({
    variant,
    signature: buildVariantAttributeSignature((variant.VariableAttributes || []).map((attr) => ({
      key: normalizeLookupText(attr.attributeKey?.name ?? String(attr.attribute_key_id)),
      value: normalizeLookupText(attr.value),
    }))),
  }));

  if (!targetSignature) {
    if (variants.length === 1) return { variant: variants[0].variant };
    return { error: `Sản phẩm "${productName}" có nhiều biến thể, vui lòng nhập Thuộc tính biến thể` };
  }

  const matchedVariant = variants.find((item) => item.signature === targetSignature);
  if (!matchedVariant) {
    return { error: `Không tìm thấy biến thể khớp với "${productName} | ${variantAttributesText}"` };
  }

  return { variant: matchedVariant.variant };
};

export const rowHasOwnData = (values) => values.some((value) => trimText(value) !== '');
