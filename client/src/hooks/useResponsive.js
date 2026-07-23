import { useState, useEffect } from "react";

const queries = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
};

function getBreakpoint() {
  if (window.matchMedia(queries.mobile).matches) return "mobile";
  if (window.matchMedia(queries.tablet).matches) return "tablet";
  return "desktop";
}

export default function useResponsive() {
  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === "undefined") return "desktop";
    return getBreakpoint();
  });

  useEffect(() => {
    const mqls = Object.values(queries).map((q) => {
      const mql = window.matchMedia(q);
      const handler = () => setBreakpoint(getBreakpoint());
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    });
    return () => mqls.forEach((cleanup) => cleanup());
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
  };
}
