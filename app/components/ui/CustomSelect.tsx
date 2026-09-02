import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { SELECT_PANEL_Z_INDEX } from '~/components/ui/layers';

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
  /**
   * Show a filter box once the list reaches this many options.
   *
   * A ward list runs to dozens of names and a chore list to a couple of dozen;
   * scrolling those to find one you can already name is slower than typing it.
   * Short lists are faster to scan than to type into, so they stay plain.
   */
  searchThreshold?: number;
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
// Caps the list so a long one scrolls internally rather than running off screen,
// and gives reposition() a figure to decide flipping against.
const MAX_PANEL_HEIGHT = 288;

// Keep the pre-paint positioning in browsers without invoking a layout effect
// during server rendering, where React cannot apply it and emits an SSR warning.
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

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
  searchThreshold = 8,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  // The open list is rendered into document.body rather than beside the trigger.
  //
  // An absolutely positioned list is clipped by any ancestor that scrolls or hides
  // overflow, and this control sits inside plenty of them — the filter panel, which
  // is overflow-y-auto, and several scrolling modals. Portalling escapes all of
  // them at once, so the component works the same wherever it is dropped.
  const [position, setPosition] = useState<{ top: number; left: number; width: number; openUpward: boolean } | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // The portalled panel lives outside dropdownRef, so click-outside has to know
  // about it separately or every click on an option would close the list.
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const searchable = options.length >= searchThreshold;

  // Substring rather than prefix: someone looking for "Dagoretti North" may
  // well type "north".
  const visibleOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query]);

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    // Clear the query, so reopening shows the whole list rather than whatever
    // was typed last time.
    setQuery('');
  }, []);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    // Start on the current choice so arrow keys move from where the user is.
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [disabled, selectedIndex]);

  // Typing narrows the list, so the old highlight index would point at a
  // different option, or past the end of it.
  useEffect(() => {
    setActiveIndex(visibleOptions.length > 0 ? 0 : -1);
  }, [query, visibleOptions.length]);

  // Focus the filter box on open, so a searchable list can be typed into
  // immediately rather than needing a second click.
  useEffect(() => {
    if (isOpen && searchable) searchRef.current?.focus();
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = dropdownRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close, isOpen]);

  // Measures the trigger so the portalled panel can sit against it.
  //
  // Flips upward when there is more room above than below, so a control near the
  // bottom of the screen opens into space rather than off the edge — which is what
  // a clipped list looks like to someone who cannot scroll it.
  const reposition = useCallback(() => {
    const trigger = dropdownRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < MAX_PANEL_HEIGHT && spaceAbove > spaceBelow;

    setPosition({
      top: openUpward ? rect.top : rect.bottom,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  }, []);

  // Laid out before paint, so the panel never appears at the wrong place first.
  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    reposition();
  }, [isOpen, reposition]);

  // The panel is fixed, so it does not travel with a scrolling ancestor. Follow
  // the trigger instead. Capture phase catches scrolls on inner containers too,
  // not just the window.
  useEffect(() => {
    if (!isOpen) return;

    const handle = () => reposition();
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [isOpen, reposition]);

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
        if (visibleOptions.length === 0) break;
        setActiveIndex((current) => (current + 1) % visibleOptions.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (visibleOptions.length === 0) break;
        setActiveIndex((current) => (current - 1 + visibleOptions.length) % visibleOptions.length);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(visibleOptions.length - 1);
        break;
      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0 && visibleOptions[activeIndex]) handleSelect(visibleOptions[activeIndex].value);
        break;
      case ' ':
        // Space selects on the trigger, but in the filter box it is just a
        // space — "day care" would otherwise be unsearchable.
        if (searchable && event.target === searchRef.current) break;
        event.preventDefault();
        if (activeIndex >= 0 && visibleOptions[activeIndex]) handleSelect(visibleOptions[activeIndex].value);
        break;
      case 'Tab':
        close();
        break;
      default:
        break;
    }
  };

  // 42px matches what FIELD_BASE_CLASS works out to, so a select and an input
  // stacked in the same form are the same height.
  const buttonSizeClass = size === 'sm' ? 'h-9 text-xs px-3 py-1.5' : 'h-[42px] text-sm px-3.5 py-2';
  const optionSizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-sm';

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

      {isOpen && position && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          data-custom-select-panel="true"
          // Fixed and portalled to the body, so no scrolling or overflow-hidden
          // ancestor can clip it. It is the topmost layer, since it may be
          // opened from inside a modal that is itself portalled to the body.
          style={{
            position: 'fixed',
            top: position.openUpward ? undefined : position.top + 8,
            bottom: position.openUpward ? window.innerHeight - position.top + 8 : undefined,
            left: position.left,
            width: position.width,
            maxHeight: MAX_PANEL_HEIGHT,
            zIndex: SELECT_PANEL_Z_INDEX,
          }}
          className="flex flex-col overflow-hidden rounded-xl border-2 border-purple-200 bg-white shadow-lg dark:border-purple-500/30 dark:bg-[#13131a] dark:shadow-glow-md">
          {searchable && (
            <div className="border-b border-purple-100 p-2 dark:border-purple-500/20">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search…"
                aria-label={ariaLabel ? `Search ${ariaLabel}` : 'Search options'}
                aria-controls={listId}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-purple-500/30 dark:bg-[#0f0f16] dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          )}
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="flex-1 overflow-y-auto"
          >
            {visibleOptions.length === 0 && (
              // An empty list and a query that matches nothing look identical
              // from here, but mean different things to the person reading it:
              // one is "nothing arrived", the other is "try another word".
              <p className="px-3.5 py-2 text-xs text-gray-500 dark:text-gray-400">
                {query.trim()
                  ? `Nothing matches “${query.trim()}”.`
                  : 'Nothing to choose from yet.'}
              </p>
            )}
            {visibleOptions.map((option, index) => {
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
        </div>,
        document.body,
      )}
    </div>
  );
}
