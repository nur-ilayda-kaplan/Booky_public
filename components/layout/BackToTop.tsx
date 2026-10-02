"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const SCROLL_THRESHOLD = 400;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Sayfanın başına dön"
      className={`fixed bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-background shadow-lg transition-all duration-300 hover:scale-110 sm:bottom-15 sm:right-10 ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-2 scale-90 opacity-0"
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
