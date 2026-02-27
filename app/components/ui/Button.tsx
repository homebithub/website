import React from 'react';

import { Link } from "react-router";
import type { LinkProps } from "react-router";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'as'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  as?: 'button' | 'a' | typeof Link;
}

export const Button = React.forwardRef<any, ButtonProps & Partial<LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>>>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    fullWidth = false,
    className = '',
    disabled,
    as = 'button',
    ...props 
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
    
    const variants = {
      primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25 focus:ring-purple-500",
      secondary: "bg-white dark:bg-dark-card text-purple-700 dark:text-purple-400 border border-purple-200/40 dark:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-900/10 focus:ring-purple-500",
      outline: "bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-400 dark:hover:text-dark-bg focus:ring-purple-500",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
      ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border focus:ring-gray-500",
    };

    const sizes = {
      xs: "px-2.5 py-1.5 text-xs",
      sm: "px-4 py-1.5 text-xs",
      md: "px-6 py-2 text-sm",
      lg: "px-8 py-3 text-base",
      xl: "px-10 py-4 text-lg",
    };

    const widthStyle = fullWidth ? "w-full" : "";
    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`;

    const content = (
      <>
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    );

    if (as === Link) {
      return (
        <Link 
          ref={ref} 
          className={combinedClassName} 
          {...props as any}
        >
          {content}
        </Link>
      );
    }

    if (as === 'a') {
      return (
        <a 
          ref={ref} 
          className={combinedClassName} 
          {...props as any}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props as any}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
