const formatToGmt7 = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);

  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export { formatToGmt7 };
