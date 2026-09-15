import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { useAccountChoiceStatus } from '~/hooks/useAccountChoiceStatus';

type FooterVariant = 'dark' | 'light';

interface FooterProps {
  variant?: FooterVariant;
}

const socialLinks = [
  { label: 'Facebook', href: 'https://web.facebook.com/profile.php?id=61582801828384', Icon: FaFacebook, color: 'text-[#1877F2]' },
  { label: 'Instagram', href: 'https://www.instagram.com/homebithub/', Icon: FaInstagram, color: 'text-[#E4405F]' },
  { label: 'X', href: 'https://x.com/homebithub', Icon: FaXTwitter, color: 'text-gray-900 dark:text-white' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/homebithub', Icon: FaLinkedin, color: 'text-[#0A66C2]' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@homebithubkenya', Icon: FaTiktok, color: 'text-gray-900 dark:text-white' },
];

function SocialLinks({ compact = false }: { compact?: boolean }) {
  return socialLinks.map(({ label, href, Icon, color }) => (
    <a
      key={label}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={`Follow HomeBit on ${label}`}
      className={`${color} transition-transform duration-200 hover:scale-125`}
    >
      <Icon aria-hidden="true" className={compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
    </a>
  ));
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
        className={`fixed bottom-0 left-5 z-30 hidden max-w-[420px] rounded-t-xl border px-3 py-2 text-[11px] shadow-lg backdrop-blur-md lg:block ${
          variant === 'light'
            ? 'border-gray-200 bg-white/90 text-gray-500 dark:border-white/10 dark:bg-[#13131a]/90 dark:text-gray-400'
            : 'border-gray-200 bg-white/90 text-gray-500 dark:border-white/10 dark:bg-[#0a0a0f]/90 dark:text-gray-400'
        }`}
      >
        <div className="flex items-center justify-end gap-2 border-b border-gray-200/70 pb-1.5 dark:border-white/10">
          <SocialLinks compact />
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
          <SocialLinks />
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
