import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
const Breadcrumbs = (props) => {
  //   console.log("Dữ liệu nhận được:", props.data);
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {props.data.map((item, index) => {
        const isLast = index === props.data.length - 1; // Phần tử cuối

        return (
          <React.Fragment key={index}>
            <Link
              to={item.route}
              className={`transition-colors duration-200 my-2 ${
                isLast
                  ? "text-[#4facf3] font-bold uppercase italic tracking-tighter"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.title}
            </Link>

            {/* Mũi tên: Chỉ hiện nếu KHÔNG PHẢI mục cuối cùng */}
            {!isLast && (
              <ChevronRight
                size={16}
                className="text-gray-400"
                strokeWidth={2}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
