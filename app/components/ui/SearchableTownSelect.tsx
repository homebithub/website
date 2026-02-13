import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";

type SearchTarget = "househelps" | "households";

interface SearchableTownSelectProps {
  value: string;
  onChange: (value: string) => void;
  target: SearchTarget;
  buttonClassName: string;
  dropdownClassName?: string;
  inputClassName?: string;
  optionClassName?: string;
}

export default function SearchableTownSelect({
  value,
  onChange,
  target,
  buttonClassName,
  dropdownClassName,
  inputClassName,
  optionClassName,
}: SearchableTownSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [totalTowns, setTotalTowns] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const endpoint = useMemo(() => {
    return `${API_BASE_URL}/api/v1/towns`;
  }, [target]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const loadTowns = async (q: string) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        target,
        limit: "12",
      });
      if (q.trim()) {
        params.set("q", q.trim());
      }

      const response = await apiClient.auth(`${endpoint}?${params.toString()}`);
      const body = await apiClient.json<any>(response);
      const towns = Array.isArray(body?.towns)
        ? body.towns
        : Array.isArray(body?.data?.towns)
          ? body.data.towns
          : [];

      const normalized = towns
        .map((town: any) => String(town || "").trim())
        .filter(Boolean);

      setOptions(normalized);
      setTotalTowns(typeof body?.count === "number" ? body.count : normalized.length);
    } catch {
      setOptions([]);
      setTotalTowns(0);
      setError("Failed to load towns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      loadTowns(query);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, query]);

  const defaultDropdownClass =
    "absolute z-20 w-full mt-1 bg-white dark:bg-[#13131a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-72 overflow-hidden";
  const defaultInputClass =
    "w-full h-10 px-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 focus:outline-none";
  const defaultOptionClass =
    "px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`${buttonClassName} flex items-center justify-between`}
      >
        <span className={value ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
          {value || "Any"}
        </span>
        <span className="ml-2 text-gray-500">▾</span>
      </button>

      {open && (
        <div className={dropdownClassName || defaultDropdownClass}>
          <div className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            {loading ? "Loading towns..." : `${totalTowns} towns`}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search town..."
            className={inputClassName || defaultInputClass}
          />

          <div className="max-h-60 overflow-y-auto">
            <div
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={optionClassName || defaultOptionClass}
            >
              Any
            </div>

            {loading && <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>}
            {!loading && error && <div className="px-3 py-2 text-sm text-red-500">{error}</div>}
            {!loading && !error && options.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No towns found</div>
            )}

            {!loading && !error &&
              options.map((town) => (
                <div
                  key={town}
                  onClick={() => {
                    onChange(town);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={optionClassName || defaultOptionClass}
                >
                  {town}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
