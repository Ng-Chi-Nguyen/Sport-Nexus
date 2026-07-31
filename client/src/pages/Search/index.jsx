import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import searchApi from "@/api/web/searchApi";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { ProductCard } from "@/components/ui/card";

const ITEMS_PER_PAGE = 12;

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;

    const { data, isLoading } = useQuery({
        queryKey: ["search", q, page],
        queryFn: () => searchApi.searchProducts({ q, limit: ITEMS_PER_PAGE, page }),
        enabled: !!q,
    });

    const products = data?.success ? data.data.products : [];
    const pagination = data?.success ? data.data.pagination : null;

    const handlePageChange = (newPage) => {
        setSearchParams({ q, page: String(newPage) });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!q) {
        return (
            <div className="min-h-screen py-8">
                <div className="mx-auto max-w-5xl text-center py-20">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Tìm kiếm sản phẩm</h2>
                    <p className="text-gray-500">Nhập từ khóa vào ô tìm kiếm phía trên.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-4 md:py-8">
            <div className="mx-auto max-w-5xl mt-6 md:mt-8">
                <Breadcrumbs
                    data={[
                        { title: "Trang chủ", route: "/" },
                        { title: `Tìm kiếm: "${q}"`, route: "" },
                    ]}
                />

                <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-4 mb-2">
                    Kết quả tìm kiếm cho &ldquo;{q}&rdquo;
                </h1>
                {pagination && (
                    <p className="text-sm text-gray-500 mb-6">
                        {pagination.totalItems} kết quả
                    </p>
                )}

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <Search size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Không tìm thấy sản phẩm
                        </h2>
                        <p className="text-gray-500">
                            Thử tìm kiếm với từ khóa khác bạn nhé.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1}
                                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Trước
                                </button>
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`px-3 py-2 text-sm rounded-lg border ${p === page ? "bg-primary text-white border-primary" : "border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= pagination.totalPages}
                                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
