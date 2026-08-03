import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, History, Search, X } from "lucide-react";
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
import { TitleWithIcon } from "@/components/ui/title";

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
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-5xl mt-6 md:mt-8 px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Lịch sử tìm kiếm", route: "" },
          ]}
        />

        <TitleWithIcon icon={History} title="Lịch sử tìm kiếm" />

        {history.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md px-6">
            <Search
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Chưa có lịch sử tìm kiếm
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Dùng ô tìm kiếm phía trên để tìm sản phẩm, lịch sử sẽ được lưu lại
              đây.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {history.length} từ khóa đã tìm
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>

            {groupRows.map((group) => (
              <div key={group.key} className="space-y-3">
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {group.label}
                </h2>
                <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                  {group.items.map((item) => (
                    <div key={item.term} className="group flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/tim-kiem?q=${encodeURIComponent(item.term)}`,
                          )
                        }
                        className="flex-1 flex items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <Clock
                          size={16}
                          className="text-slate-400 dark:text-slate-500 shrink-0"
                        />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {item.term}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTerm(item.term)}
                        className="p-2.5 mr-3 rounded-xl text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
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
          <div className="mt-12 space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
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
