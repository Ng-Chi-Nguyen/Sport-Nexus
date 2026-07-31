import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Search, X } from "lucide-react";
import dayjs from "dayjs";
import {
  clearSearchHistory,
  getSearchHistory,
  removeFromSearchHistory,
} from "@/lib/searchHistory";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import searchApi from "@/api/web/searchApi";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { ProductCard } from "@/components/ui/card";

const groupByTime = (items) => {
  const today = dayjs().startOf("day");
  const yesterday = today.subtract(1, "day");
  const groups = { today: [], yesterday: [], older: [] };
  items.forEach((item) => {
    const day = dayjs(item.ts).startOf("day");
    if (day.isSame(today)) groups.today.push(item);
    else if (day.isSame(yesterday)) groups.yesterday.push(item);
    else groups.older.push(item);
  });
  return groups;
};

const SearchHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => getSearchHistory());

  const terms = history.slice(0, 3).map((item) => item.term);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["search-history-suggestions", terms.join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        terms.map((term) => searchApi.searchProducts({ q: term, limit: 4 })),
      );
      const seen = new Set();
      const products = [];
      results.forEach((res) => {
        if (!res?.success) return;
        (res.data.products || []).forEach((p) => {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            products.push(p);
          }
        });
      });
      return products.slice(0, 12);
    },
    enabled: terms.length > 0,
  });

  const deleteTerm = (term) => {
    removeFromSearchHistory(term);
    setHistory(getSearchHistory());
  };

  const clearAll = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const groups = groupByTime(history);
  const groupRows = [
    { key: "today", label: "Hôm nay", items: groups.today },
    { key: "yesterday", label: "Hôm qua", items: groups.yesterday },
    { key: "older", label: "Trước đó", items: groups.older },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="mx-auto max-w-5xl mt-6 md:mt-8 px-4">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Lịch sử tìm kiếm", route: "" },
          ]}
        />

        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-4 mb-2">
          Lịch sử tìm kiếm
        </h1>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Chưa có lịch sử tìm kiếm
            </h2>
            <p className="text-gray-500">
              Dùng ô tìm kiếm phía trên để tìm sản phẩm, lịch sử sẽ được lưu lại đây.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {history.length} từ khóa đã tìm
              </p>
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            {groupRows.map((group) => (
              <div key={group.key} className="mb-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  {group.label}
                </h2>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <div key={item.term} className="group flex items-center">
                      <button
                        onClick={() => navigate(`/tim-kiem?q=${encodeURIComponent(item.term)}`)}
                        className="flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Clock size={16} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-800">{item.term}</span>
                      </button>
                      <button
                        onClick={() => deleteTerm(item.term)}
                        className="p-2 mr-2 text-gray-300 hover:text-red-500 transition-colors"
                        aria-label={`Xóa ${item.term} khỏi lịch sử`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">
              Có thể bạn quan tâm
            </h2>
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {suggestions.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistoryPage;
