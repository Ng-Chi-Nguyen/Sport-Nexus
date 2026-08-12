export const getMemberPrice = (price, discountPercent = 0) => {
  if (!discountPercent) return Number(price);
  return Math.round(Number(price) * (1 - discountPercent / 100));
};
