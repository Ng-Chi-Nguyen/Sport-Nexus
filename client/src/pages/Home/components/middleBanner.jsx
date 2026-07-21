import { useEffect, useRef } from "react";
import logoDefault from "@/assets/images/logodefault.jpg";

export const MiddleBanner = ({ brands = [] }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animationId;
    let pos = 0;

    const scroll = () => {
      pos -= 0.5;
      if (pos <= -el.scrollWidth / 2) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      animationId = requestAnimationFrame(scroll);
    };

    const handleEnter = () => {
      if (animationId) cancelAnimationFrame(animationId);
    };

    const handleLeave = () => {
      animationId = requestAnimationFrame(scroll);
    };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);

    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [brands]);

  if (brands.length === 0) return null;

  const brandItems = brands.map((brand) => (
    <div
      key={brand.id}
      className="inline-flex items-center justify-center mx-8 shrink-0"
    >
      <img
        src={brand.logo || logoDefault}
        alt={brand.name}
        className="h-10 md:h-14 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = logoDefault;
        }}
      />
    </div>
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-14 select-none">
      <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-2xl border border-slate-100 shadow-sm py-8 md:py-10 px-4">
        <div className="relative overflow-hidden">
          <div className="flex">
          <div
            ref={containerRef}
            className="flex items-center whitespace-nowrap will-change-transform"
          >
            {brandItems}
            {brandItems}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};


