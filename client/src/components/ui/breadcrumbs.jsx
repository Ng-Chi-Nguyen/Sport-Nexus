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
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {item.title}
            </Link>

            {/* Mũi tên: Chỉ hiện nếu KHÔNG PHẢI mục cuối cùng */}
            {!isLast && (
              <ChevronRight
                size={16}
                className="text-slate-600"
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
