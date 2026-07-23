import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import searchApi from "@/api/web/searchApi";

const DEBOUNCE_MS = 300;

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [total, setTotal] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const navigate = useNavigate();
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

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
        debounceRef.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS);
    };

    const handleSubmit = (searchQuery) => {
        const q = (searchQuery || query).trim();
        if (!q) return;
        setIsOpen(false);
        navigate(`/tim-kiem?q=${encodeURIComponent(q)}`);
    };

    const handleSelect = (slug) => {
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
            <div className="relative flex items-center">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    strokeWidth={2}
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (suggestions.length) setIsOpen(true); }}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full h-10 pl-10 pr-24 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(""); setSuggestions([]); setIsOpen(false); inputRef.current?.focus(); }}
                        className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
                <button
                    onClick={() => handleSubmit()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors duration-200"
                >
                    Tìm kiếm
                </button>
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {suggestions.map((item, idx) => (
                        <button
                            key={item.id}
                            onMouseDown={() => handleSelect(item.slug)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${idx === activeIdx ? "bg-primary/5" : "hover:bg-gray-50"}`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Search size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                    {item.brand?.name && `${item.brand.name} · `}
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.base_price)}
                                </p>
                            </div>
                        </button>
                    ))}
                    <button
                        onMouseDown={() => handleSubmit(query)}
                        className="w-full px-4 py-3 text-sm font-medium text-primary border-t border-gray-100 hover:bg-primary/5 text-center"
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
