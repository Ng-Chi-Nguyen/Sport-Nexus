const formatToGmt7 = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);

  const day = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  // Lấy giờ theo định dạng vi-VN
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  return `${day} ${time}`;
};

export { formatToGmt7 };
