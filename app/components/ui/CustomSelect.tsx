import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  /** Accessible name, when no visible <label> wraps the control. */
  ariaLabel?: string;
}

/**
 * A select whose option list is ours to style.
 *
 * A native <select> renders its open list through the operating system, so the
 * list ignores the site theme — on macOS it appears white with a blue
 * highlight regardless of dark mode. This renders the list itself, at the cost
 * of reimplementing the keyboard behaviour a native select gets for free:
 * arrow keys, Home/End, Enter to choose, Escape to dismiss.
 */
export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  required = false,
  disabled = false,
  size = 'md',
  ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    // Start on the current choice so arrow keys move from where the user is.
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [disabled, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close, isOpen]);

  // Keep the highlighted option visible while arrowing through a long list.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    close();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        // Stop here so a surrounding modal does not also close.
        event.stopPropagation();
        close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % options.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + options.length) % options.length);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && options[activeIndex]) handleSelect(options[activeIndex].value);
        break;
      case 'Tab':
        close();
        break;
      default:
        break;
    }
  };

  const buttonSizeClass = size === 'sm' ? 'h-10 text-xs px-3 py-2' : 'h-12 text-sm px-4 py-3';
  const optionSizeClass = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listId : undefined}
        aria-required={required || undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`w-full ${buttonSizeClass} flex items-center justify-between rounded-xl border-2 border-purple-200 bg-white text-gray-900 shadow-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-purple-500/30 dark:bg-[#13131a] dark:text-white dark:shadow-inner-glow`}
      >
        <span className={selectedOption ? 'truncate' : 'truncate text-gray-500 dark:text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`ml-2 h-5 w-5 shrink-0 text-gray-500 transition-transform dark:text-gray-400 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border-2 border-purple-200 bg-white shadow-lg dark:border-purple-500/30 dark:bg-[#13131a] dark:shadow-glow-md">
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="max-h-60 overflow-y-auto"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-index={index}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full ${optionSizeClass} text-left transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-white'
                      : isActive
                        ? 'bg-purple-50 text-gray-900 dark:bg-purple-900/30 dark:text-white'
                        : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
