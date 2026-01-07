import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Khởi tạo Client chứa logic bộ nhớ đệm
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 phút dữ liệu mới cũ đi (stale)
      refetchOnWindowFocus: false, // Không load lại khi chuyển tab
    },
  },
});

// Tạo Provider để bọc ứng dụng (Nên dùng .jsx cho đoạn này)
export const SportNexusProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools giúp bạn nhìn thấy dữ liệu đang lưu trong cache */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
