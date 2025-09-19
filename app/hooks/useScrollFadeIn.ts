import { useEffect } from "react";

export default function useScrollFadeIn(selector = ".fade-in-scroll", options = { threshold: 0.15 }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = document.querySelectorAll(selector);
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add("opacity-100", "translate-y-0"));
      return;
    }
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
            observer.unobserve(entry.target);
          }
        });
      },
      options
    );
    elements.forEach((el) => {
      el.classList.add("opacity-0", "translate-y-8", "transition-all", "duration-700");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [selector, options]);
}
