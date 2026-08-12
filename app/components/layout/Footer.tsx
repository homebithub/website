import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAccountChoiceStatus } from '~/hooks/useAccountChoiceStatus';

type FooterVariant = 'dark' | 'light';

interface FooterProps {
  variant?: FooterVariant;
}

const Footer: React.FC<FooterProps> = ({ variant = 'dark' }) => {
  const location = useLocation();
  const { isInSetupMode } = useAccountChoiceStatus();
  const footerRef = useRef<HTMLElement | null>(null);
  const normalFooterHeightRef = useRef(0);
  const compactRef = useRef(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setCompact(false);
    compactRef.current = false;
    normalFooterHeightRef.current = 0;

    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const footer = footerRef.current;
        if (!footer || window.innerWidth < 1024) {
          compactRef.current = false;
          setCompact(false);
          return;
        }

        if (!compactRef.current) {
          normalFooterHeightRef.current = footer.getBoundingClientRect().height;
        }

        // Exclude the footer's own height so it cannot turn a short page into
        // a long one and repeatedly switch between the two layouts.
        const normalFooterHeight = normalFooterHeightRef.current || 112;
        const pageHeightWithoutFooter = document.documentElement.scrollHeight
          + (compactRef.current ? normalFooterHeight : 0)
          - normalFooterHeight;
        const nextCompact = pageHeightWithoutFooter > window.innerHeight + 80;
        compactRef.current = nextCompact;
        setCompact(nextCompact);
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    window.addEventListener('resize', measure);
    measure();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [location.pathname]);

  // Hide the footer while a household is choosing or joining a household.
  if (isInSetupMode) {
    return null;
  }

  const baseClasses = 'border-t py-8 transition-colors duration-300';
  const themeClasses =
    variant === 'light'
      ? 'bg-white text-gray-800 border-gray-200 dark:bg-[#0a0a0f] dark:text-gray-300 dark:border-purple-500/20'
      : 'bg-white text-gray-700 border-gray-200 dark:bg-[#0a0a0f] dark:text-gray-300 dark:border-purple-500/20';

  if (compact) {
    return (
      <footer
        ref={footerRef}
        data-site-footer
        aria-label="Website information"
        className={`fixed bottom-20 right-5 z-30 hidden max-w-[420px] rounded-xl border px-3 py-2 text-[11px] shadow-lg backdrop-blur-md lg:block ${
          variant === 'light'
            ? 'border-gray-200 bg-white/90 text-gray-500 dark:border-white/10 dark:bg-[#13131a]/90 dark:text-gray-400'
            : 'border-gray-200 bg-white/90 text-gray-500 dark:border-white/10 dark:bg-[#0a0a0f]/90 dark:text-gray-400'
        }`}
      >
        <div className="flex items-center justify-end gap-2 border-b border-gray-200/70 pb-1.5 dark:border-white/10">
          <a href="https://web.facebook.com/profile.php?id=61582801828384" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-purple-400"><svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a href="https://www.instagram.com/homebithub/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-purple-400"><svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.012 3.584-.069 4.849c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.013-3.583.07-4.849c.149-3.227 1.664-4.771 4.919-4.919C8.417 2.175 8.796 2.163 12 2.163zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324A6.162 6.162 0 0012 5.838zM12 16a4 4 0 110-8 4 4 0 010 8z"/></svg></a>
          <a href="https://x.com/homebithub" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-purple-400"><svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
          <a href="https://www.linkedin.com/company/homebithub" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-purple-400"><svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.127 2.062 2.062 0 010 4.127zm1.782 13.019H3.555V9h3.564z"/></svg></a>
        </div>
        <nav className="mt-1.5 flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
          <Link to="/privacy" prefetch="viewport" className="hover:text-purple-400">Privacy</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms" prefetch="viewport" className="hover:text-purple-400">Terms</Link>
          <span aria-hidden="true">·</span>
          <Link to="/cookies" prefetch="viewport" className="hover:text-purple-400">Cookies</Link>
          <span aria-hidden="true">·</span>
          <Link to="/contact" prefetch="viewport" className="hover:text-purple-400">Contact</Link>
          <span aria-hidden="true">·</span>
          <span><span className="gradient-text font-semibold">Homebit</span> © {new Date().getFullYear()}</span>
        </nav>
      </footer>
    );
  }

  return (
    <footer ref={footerRef} data-site-footer className={`${baseClasses} ${themeClasses}`}>
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="mb-4 md:mb-0">
          <span className="font-bold text-base gradient-text">Homebit</span> <span className="text-gray-400">&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://web.facebook.com/profile.php?id=61582801828384" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-purple-400 hover:scale-125 transition-all duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://www.instagram.com/homebithub/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-purple-400 hover:scale-125 transition-all duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://x.com/homebithub" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-gray-400 hover:text-purple-400 hover:scale-125 transition-all duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.linkedin.com/company/homebithub" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-purple-400 hover:scale-125 transition-all duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm">
          <Link to="/blog" prefetch="viewport" className="hover:text-purple-400 transition-colors duration-200">Blog</Link>
          <Link to="/privacy" prefetch="viewport" className="hover:text-purple-400 transition-colors duration-200">Privacy Policy</Link>
          <Link to="/cookies" prefetch="viewport" className="hover:text-purple-400 transition-colors duration-200">Cookie Policy</Link>
          <Link to="/terms" prefetch="viewport" className="hover:text-purple-400 transition-colors duration-200">Terms of Service</Link>
          <Link to="/contact" prefetch="viewport" className="hover:text-purple-400 transition-colors duration-200">Contact</Link>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
