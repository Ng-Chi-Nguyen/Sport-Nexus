import { useState } from "react";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Trophy, DollarSign, MessageSquareText, Star, StarHalf, TrendingDown, ArrowDown, ThumbsDown, ArrowUp, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const LIMITS = [5, 10, 15, 999];

const RankIcon = ({ i }) => {
  if (i === 0) return <Trophy size={12} className="text-amber-400" />;
  if (i === 1) return <Trophy size={12} className="text-slate-300" />;
  if (i === 2) return <Trophy size={12} className="text-amber-600" />;
  return <span className="w-3 text-center text-[10px] font-bold text-slate-500">{i + 1}</span>;
};

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: full }, (_, i) => <Star key={i} size={10} fill="currentColor" />)}
      {half && <StarHalf size={10} fill="currentColor" />}
    </span>
  );
};

const LimitToggle = ({ limits = LIMITS, value, onChange }) => (
  <div className="flex items-center gap-1">
    {limits.map((l) => (
      <button
        key={l}
        onClick={() => onChange(l)}
        className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
          value === l ? "bg-sky-600/20 text-sky-400 border border-sky-700/50" : "text-slate-500 hover:text-slate-300 border border-transparent"
        }`}
      >
        {l >= 999 ? "Tất cả" : l}
      </button>
    ))}
  </div>
);

const thCls = "pb-2 pr-2 font-medium";
const tdCls = "py-1.5 pr-2";

export const TopSellingTable = ({ data = [] }) => {
  const [limit, setLimit] = useState(15);
  const visible = limit >= 999 ? data : data.slice(0, limit);
  return (
    <Card title="Bán chạy nhất" icon={<Trophy size={16} />} action={<LimitToggle value={limit} onChange={setLimit} />}>
      {visible.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className={thCls} />
                <th className={thCls}>Sản phẩm</th>
                <th className={`${thCls} text-right`}>Đã bán</th>
                <th className={`${thCls} text-right`}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.productId} className="border-b border-slate-900 last:border-0">
                  <td className={tdCls}><RankIcon i={i} /></td>
                  <td className={`${tdCls} font-medium text-slate-200 truncate max-w-[180px]`}>{p.name}</td>
                  <td className={`${tdCls} text-right text-slate-300`}>{p.totalSold}</td>
                  <td className={`${tdCls} text-right font-semibold text-emerald-400`}>{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Placeholder />}
    </Card>
  );
};

export const TopRevenueTable = ({ data = [] }) => {
  const [limit, setLimit] = useState(15);
  const visible = limit >= 999 ? data : data.slice(0, limit);
  return (
    <Card title="Doanh thu cao nhất" icon={<DollarSign size={16} />} action={<LimitToggle value={limit} onChange={setLimit} />}>
      {visible.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className={thCls} />
                <th className={thCls}>Sản phẩm</th>
                <th className={`${thCls} text-right`}>Đã bán</th>
                <th className={`${thCls} text-right`}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.productId} className="border-b border-slate-900 last:border-0">
                  <td className={tdCls}><RankIcon i={i} /></td>
                  <td className={`${tdCls} font-medium text-slate-200 truncate max-w-[180px]`}>{p.name}</td>
                  <td className={`${tdCls} text-right text-slate-300`}>{p.totalSold}</td>
                  <td className={`${tdCls} text-right font-semibold text-emerald-400`}>{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Placeholder />}
    </Card>
  );
};

export const WorstSellingTable = ({ data = [] }) => {
  const [limit, setLimit] = useState(15);
  const visible = limit >= 999 ? data : data.slice(0, limit);
  return (
    <Card title="Bán ít nhất" icon={<TrendingDown size={16} />} action={<LimitToggle value={limit} onChange={setLimit} />}>
      {visible.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className={thCls} />
                <th className={thCls}>Sản phẩm</th>
                <th className={`${thCls} text-right`}>Đã bán</th>
                <th className={`${thCls} text-right`}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.productId} className="border-b border-slate-900 last:border-0">
                  <td className={tdCls}><span className="w-3 text-center text-[10px] font-bold text-red-400">{i + 1}</span></td>
                  <td className={`${tdCls} font-medium text-slate-200 truncate max-w-[180px]`}>{p.name}</td>
                  <td className={`${tdCls} text-right font-semibold text-red-400`}>{p.totalSold}</td>
                  <td className={`${tdCls} text-right text-slate-400`}>{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Placeholder />}
    </Card>
  );
};

export const LowestRevenueTable = ({ data = [] }) => {
  const [limit, setLimit] = useState(15);
  const visible = limit >= 999 ? data : data.slice(0, limit);
  return (
    <Card title="Doanh thu thấp nhất" icon={<ArrowDown size={16} />} action={<LimitToggle value={limit} onChange={setLimit} />}>
      {visible.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className={thCls} />
                <th className={thCls}>Sản phẩm</th>
                <th className={`${thCls} text-right`}>Đã bán</th>
                <th className={`${thCls} text-right`}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.productId} className="border-b border-slate-900 last:border-0">
                  <td className={tdCls}><span className="w-3 text-center text-[10px] font-bold text-red-400">{i + 1}</span></td>
                  <td className={`${tdCls} font-medium text-slate-200 truncate max-w-[180px]`}>{p.name}</td>
                  <td className={`${tdCls} text-right text-slate-400`}>{p.totalSold}</td>
                  <td className={`${tdCls} text-right font-semibold text-red-400`}>{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Placeholder />}
    </Card>
  );
};

export const ReviewOverview = ({ most = [], least = [] }) => {
  const [showMost, setShowMost] = useState(true);
  const [limit, setLimit] = useState(30);
  const data = showMost ? most : least;
  const visible = limit >= 999 ? data : data.slice(0, limit);
  return (
    <Card title="Đánh giá" icon={<MessageSquareText size={16} />} action={<LimitToggle limits={[10, 20, 30, 999]} value={limit} onChange={setLimit} />}>
      <div className="flex rounded-lg border border-slate-700 overflow-hidden mb-3 w-fit">
        <ToggleBtn label="Nhiều nhất" icon={<MessageSquareText size={10} />} active={showMost} onClick={() => setShowMost(true)} />
        <ToggleBtn label="Ít nhất" icon={<ThumbsDown size={10} />} active={!showMost} onClick={() => setShowMost(false)} />
      </div>
      {visible.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className={thCls} />
                <th className={thCls}>Sản phẩm</th>
                <th className={`${thCls} text-right`}>Số review</th>
                <th className={`${thCls} text-right`}>Điểm TB</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.productId} className="border-b border-slate-900 last:border-0">
                  <td className={tdCls}>
                    {showMost ? (
                      <span className={`text-[10px] font-bold ${i < 3 ? "text-amber-400" : "text-slate-500"}`}>{i + 1}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-400">{i + 1}</span>
                    )}
                  </td>
                  <td className={`${tdCls} font-medium text-slate-200 truncate max-w-[160px]`}>{p.name}</td>
                  <td className={`${tdCls} text-right ${showMost ? "text-slate-300" : "text-red-400 font-semibold"}`}>{p.reviewCount}</td>
                  <td className={`${tdCls} text-right`}><StarRating rating={p.avgRating} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Placeholder />}
    </Card>
  );
};

const ToggleBtn = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2.5 py-1 text-[10px] font-medium transition-colors flex items-center gap-1 border-r border-slate-700 last:border-r-0 ${
      active ? "bg-sky-600/20 text-sky-400" : "text-slate-500 hover:text-slate-300"
    }`}
  >
    {icon} {label}
  </button>
);

export const SellingOverview = ({ top = [], worst = [] }) => {
  const [showTop, setShowTop] = useState(true);
  const [limit, setLimit] = useState(15);
  const source = showTop ? top : worst;
  const visible = limit >= 999 ? source : source.slice(0, limit);
  return (
    <Card title="Bán hàng" icon={<ShoppingBag size={16} />} action={<LimitToggle value={limit} onChange={setLimit} />}>
      <div className="flex rounded-lg border border-slate-700 overflow-hidden mb-3 w-fit">
        <ToggleBtn label="Bán chạy" icon={<Trophy size={10} />} active={showTop} onClick={() => setShowTop(true)} />
        <ToggleBtn label="Bán ít" icon={<TrendingDown size={10} />} active={!showTop} onClick={() => setShowTop(false)} />
      </div>
      {visible.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className={thCls} />
                <th className={thCls}>Sản phẩm</th>
                <th className={`${thCls} text-right`}>Đã bán</th>
                <th className={`${thCls} text-right`}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.productId} className="border-b border-slate-900 last:border-0">
                  <td className={tdCls}>
                    {showTop ? <RankIcon i={i} /> : <span className="text-[10px] font-bold text-red-400">{i + 1}</span>}
                  </td>
                  <td className={`${tdCls} font-medium text-slate-200 truncate max-w-[180px]`}>{p.name}</td>
                  <td className={`${tdCls} text-right ${showTop ? "text-slate-300" : "text-red-400 font-semibold"}`}>{p.totalSold}</td>
                  <td className={`${tdCls} text-right ${showTop ? "font-semibold text-emerald-400" : "text-slate-400"}`}>{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Placeholder />}
    </Card>
  );
};

export const RevenueOverview = ({ top = [], lowest = [] }) => {
  const [showTop, setShowTop] = useState(true);
  const [limit, setLimit] = useState(15);
  const source = showTop ? top : lowest;
  const visible = limit >= 999 ? source : source.slice(0, limit);
  return (
    <Card title="Doanh thu" icon={<DollarSign size={16} />} action={<LimitToggle value={limit} onChange={setLimit} />}>
      <div className="flex rounded-lg border border-slate-700 overflow-hidden mb-3 w-fit">
        <ToggleBtn label="Cao nhất" icon={<ArrowUp size={10} />} active={showTop} onClick={() => setShowTop(true)} />
        <ToggleBtn label="Thấp nhất" icon={<ArrowDown size={10} />} active={!showTop} onClick={() => setShowTop(false)} />
      </div>
      {visible.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className={thCls} />
                <th className={thCls}>Sản phẩm</th>
                <th className={`${thCls} text-right`}>Đã bán</th>
                <th className={`${thCls} text-right`}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.productId} className="border-b border-slate-900 last:border-0">
                  <td className={tdCls}>
                    {showTop ? <RankIcon i={i} /> : <span className="text-[10px] font-bold text-red-400">{i + 1}</span>}
                  </td>
                  <td className={`${tdCls} font-medium text-slate-200 truncate max-w-[180px]`}>{p.name}</td>
                  <td className={`${tdCls} text-right ${showTop ? "text-slate-300" : "text-slate-400"}`}>{p.totalSold}</td>
                  <td className={`${tdCls} text-right ${showTop ? "font-semibold text-emerald-400" : "text-red-400 font-semibold"}`}>{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Placeholder />}
    </Card>
  );
};

const Placeholder = () => (
  <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
);
