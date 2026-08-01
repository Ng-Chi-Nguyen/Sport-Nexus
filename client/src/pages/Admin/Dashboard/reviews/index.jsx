import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { MessageSquareText, Star, Eye, EyeOff, Loader } from "lucide-react";

const SITEMS = [
  {
    key: "totalReviews",
    label: "Tổng đánh giá",
    icon: <MessageSquareText size={16} />,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    key: "avgRating",
    label: "Điểm TB",
    icon: <Star size={16} />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    fmt: (v) => Number(v || 0).toFixed(1),
  },
  {
    key: "visibleReviews",
    label: "Hiển thị",
    icon: <Eye size={16} />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    key: "hiddenReviews",
    label: "Ẩn",
    icon: <EyeOff size={16} />,
    color: "text-rose-600 dark:text-red-400",
    bg: "bg-rose-500/10 dark:bg-red-500/20",
  },
];

const SummaryCards = ({ summary = {} }) => (
  <div className="grid gap-3 sm:grid-cols-4 items-start">
    {SITEMS.map((item) => {
      const val = summary[item.key] ?? 0;
      const display = item.fmt ? item.fmt(val) : val.toLocaleString();
      return (
        <Card key={item.key}>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
            >
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p className={`text-lg font-bold truncate ${item.color}`}>
                {display}
              </p>
            </div>
          </div>
        </Card>
      );
    })}
  </div>
);

const StarRating = ({ rating }) => (
  <span className="inline-flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={9}
        fill={i < rating ? "currentColor" : "none"}
        opacity={i < rating ? 1 : 0.3}
      />
    ))}
  </span>
);

const RatingDist = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  return (
    <Card title="Phân bố đánh giá" icon={<Star size={16} />}>
      {data.length ? (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const entry = data.find((d) => d.rating === star);
            const count = entry?.count || 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {star}
                </span>
                <StarRating rating={star} />
                {/* Rãnh chứa thanh tiến trình */}
                <div
                  className="flex-1 h-2 rounded-full border overflow-hidden p-[1px] transition-colors duration-200
                                bg-slate-100 border-slate-200 
                                dark:bg-slate-900/80 dark:border-slate-800"
                >
                  <div
                    className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-300"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          Chưa có dữ liệu
        </div>
      )}
    </Card>
  );
};

const RecentReviewsTable = ({ data = [] }) => (
  <Card title="Đánh giá gần đây" icon={<MessageSquareText size={16} />}>
    {data.length ? (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="pb-2 pr-2 font-medium">Sản phẩm</th>
              <th className="pb-2 pr-2 font-medium">Đánh giá</th>
              <th className="pb-2 pr-2 font-medium">Nội dung</th>
              <th className="pb-2 pr-2 font-medium">Ẩn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {data.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
              >
                <td className="py-2 pr-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {r.productName}
                </td>
                <td className="py-2 pr-2">
                  <StarRating rating={r.rating} />
                </td>
                <td className="py-2 pr-2 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                  {r.comment || "—"}
                </td>
                <td className="py-2 pr-2">
                  {r.is_hidden ? (
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-600 border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-transparent">
                      Ẩn
                    </span>
                  ) : (
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent">
                      Hiện
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
        Chưa có dữ liệu
      </div>
    )}
  </Card>
);

export const ReviewOverview = () => {
  const { data: res, isLoading } = useQuery({
    queryKey: ["management-dashboard-review-overview"],
    queryFn: () => dashboardApi.getReviewOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 font-medium text-sm transition-colors duration-200">
        <Loader size={20} className="animate-spin mr-2 text-sky-500" />
        Đang tải dữ liệu đánh giá...
      </div>
    );
  }

  const raw = res?.data || {};
  const data = raw.data || raw;

  return (
    <div className="space-y-4">
      <SummaryCards summary={data.summary || {}} />
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <RatingDist data={data.ratingDistribution || []} />
        <RecentReviewsTable data={data.recentReviews || []} />
      </div>
    </div>
  );
};
