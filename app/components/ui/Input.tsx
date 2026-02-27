import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helpText, 
    leftIcon, 
    rightIcon, 
    className = '', 
    containerClassName = '',
    id,
    ...props 
  }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl border-2 transition-all duration-200 outline-none
              bg-white dark:bg-dark-card
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              ${leftIcon ? 'pl-11' : 'px-4'}
              ${rightIcon ? 'pr-11' : 'px-4'}
              py-2.5 text-sm
              ${error 
                ? 'border-red-300 dark:border-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                : 'border-gray-100 dark:border-dark-border focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:border-purple-500/50'
              }
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-xs font-medium text-red-500 ml-1 animate-fadeIn">
            {error}
          </span>
        )}
        
        {helpText && !error && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {helpText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
