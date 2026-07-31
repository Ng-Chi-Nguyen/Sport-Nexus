import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Search, X } from "lucide-react";
import searchApi from "@/api/web/searchApi";
import {
  addToSearchHistory,
  clearSearchHistory,
  getSearchHistory,
  recordLastSearchTerm,
  removeFromSearchHistory,
} from "@/lib/searchHistory";

const DEBOUNCE_MS = 300;

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [total, setTotal] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [history, setHistory] = useState(() => getSearchHistory());
    const navigate = useNavigate();
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    const saveTerm = (term) => {
        addToSearchHistory(term);
        setHistory(getSearchHistory());
    };

  const fetchSuggestions = useCallback(async (q) => {
    if (!q.trim()) {
      setSuggestions([]);
      setTotal(0);
      setIsOpen(false);
      return;
    }
    try {
      const res = await searchApi.searchProducts({ q: q.trim(), limit: 5 });
      if (res.success) {
        setSuggestions(res.data.products || []);
        setTotal(res.data.pagination?.totalItems || 0);
        setIsOpen(true);
      }
    } catch {
      // silent fail
    }
  }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setActiveIdx(-1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!val.trim()) {
            setSuggestions([]);
            setTotal(0);
            setIsOpen(true);
            return;
        }
        debounceRef.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS);
    };

    const handleSubmit = (searchQuery) => {
        const q = (searchQuery || query).trim();
        if (!q) return;
        saveTerm(q);
        recordLastSearchTerm(q);
        setIsOpen(false);
        navigate(`/tim-kiem?q=${encodeURIComponent(q)}`);
    };

    const handleSelect = (slug) => {
        const q = query.trim();
        saveTerm(q);
        recordLastSearchTerm(q);
        setIsOpen(false);
        navigate(`/san-pham/${slug}`);
    };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        handleSelect(suggestions[activeIdx].slug);
      } else {
        handleSubmit();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev < suggestions.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-2xl hidden sm:block">
      {/* 1. Bọc container có overflow-hidden để mọi viền nhô ra ngoài đều bị cắt gọn theo góc bo */}
      <div className="relative flex items-center rounded-full overflow-hidden border border-gray-200 focus-within:border-primary transition-colors">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10"
          strokeWidth={2}
        />

        {/* 2. Triệt tiêu hoàn toàn outline/ring/focus-visible trên Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full h-10 pl-10 pr-24 bg-gray-50 text-sm placeholder:text-gray-400 focus:bg-white
            outline-none focus:outline-none focus-visible:outline-none 
            ring-0 focus:ring-0 focus-visible:ring-0 border-none focus:border-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 outline-none focus:outline-none focus-visible:outline-none ring-0"
          >
            <X size={16} />
          </button>
        )}

        {/* 3. Tắt outline/ring trên Nút Tìm Kiếm */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-medium transition-colors duration-200 shrink-0
            outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 border-none"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Dropdown lịch sử tìm kiếm khi ô trống */}
      {isOpen && !query.trim() &&
        (history.length > 0 ? (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Lịch sử tìm kiếm
              </span>
              <button
                type="button"
                onClick={() => {
                  clearSearchHistory();
                  setHistory(getSearchHistory());
                }}
                className="text-xs text-gray-400 hover:text-primary transition-colors outline-none focus:outline-none"
              >
                Xóa tất cả
              </button>
            </div>
            {history.map((item) => (
              <div key={item.term} className="group flex items-center px-2 hover:bg-gray-50">
                <button
                  type="button"
                  onMouseDown={() => handleSubmit(item.term)}
                  className="flex-1 flex items-center gap-3 py-2.5 px-2 text-left outline-none focus:outline-none"
                >
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{item.term}</span>
                </button>
                <button
                  type="button"
                  onMouseDown={() => {
                    removeFromSearchHistory(item.term);
                    setHistory(getSearchHistory());
                  }}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors outline-none focus:outline-none"
                  aria-label={`Xóa ${item.term} khỏi lịch sử`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-6 text-center text-sm text-gray-500">
            Chưa có lịch sử tìm kiếm
          </div>
        ))}

      {/* Dropdown danh sách gợi ý */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={() => handleSelect(item.slug)}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors outline-none focus:outline-none ${
                idx === activeIdx ? "bg-primary/5" : "hover:bg-gray-50"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Search size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.brand?.name && `${item.brand.name} · `}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.base_price)}
                </p>
              </div>
            </button>
          ))}
          <button
            type="button"
            onMouseDown={() => handleSubmit(query)}
            className="w-full px-4 py-3 text-sm font-medium text-primary border-t border-gray-100 hover:bg-primary/5 text-center outline-none focus:outline-none"
          >
            Xem tất cả {total} kết quả
          </button>
        </div>
      )}

      {isOpen && query && suggestions.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-6 text-center text-sm text-gray-500">
          Không tìm thấy sản phẩm nào
        </div>
      )}
    </div>
  );
};

export default SearchBar;
