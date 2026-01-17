import React from 'react';
import { Link } from 'react-router';

type FooterVariant = 'dark' | 'light';

interface FooterProps {
  variant?: FooterVariant;
}

const Footer: React.FC<FooterProps> = ({ variant = 'dark' }) => {
  const baseClasses = 'py-8 border-t transition-colors duration-300';
  const themeClasses =
    variant === 'light'
      ? 'bg-white text-gray-800 border-gray-200 dark:bg-[#0a0a0f] dark:text-gray-300 dark:border-purple-500/20'
      : 'bg-gray-900 dark:bg-[#0a0a0f] text-gray-100 dark:text-gray-300 border-gray-800 dark:border-purple-500/20';

  return (
    <footer className={`${baseClasses} ${themeClasses}`}>
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <span className="font-bold text-lg gradient-text">Homebit</span> <span className="text-gray-400">&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex space-x-6">
          <Link to="/privacy" prefetch="viewport" className="hover:text-purple-400 transition-colors duration-200">Privacy Policy</Link>
          <Link to="/terms" prefetch="viewport" className="hover:text-purple-400 transition-colors duration-200">Terms of Service</Link>
          <Link to="/contact" prefetch="viewport" className="hover:text-purple-400 transition-colors duration-200">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
