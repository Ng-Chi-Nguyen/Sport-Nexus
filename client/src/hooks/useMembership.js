import { useCallback, useEffect, useState } from "react";
import loyaltyApi from "@/api/customer/loyaltyApi";

const useMembership = () => {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembership = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loyaltyApi.getMembership();
      setMembership(res?.data ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Không tải được thông tin thành viên");
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  return { membership, loading, error, refresh: fetchMembership };
};

export default useMembership;
