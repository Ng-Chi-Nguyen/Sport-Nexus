import { useEffect, useState } from "react";
import loyaltyApi from "@/api/customer/loyaltyApi";

let cache = { userId: null, percent: 0 };

const useMemberDiscount = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!user?.id || cache.userId === user.id) return;
    let alive = true;
    loyaltyApi
      .getMembership()
      .then((res) => {
        const pct = Number(res?.data?.tier?.discount_percent) || 0;
        cache = { userId: user.id, percent: pct };
        if (alive) setPercent(pct);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user?.id]);

  return user?.id && cache.userId === user.id ? cache.percent : percent;
};

export default useMemberDiscount;
