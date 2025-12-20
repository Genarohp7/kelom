// src/Components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // si quieres animación, cambia a "smooth"
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
