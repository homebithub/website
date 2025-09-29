import React from "react";

export default function ShortlistPlaceholderIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#A78BFA" fillOpacity="0.3" />
        <path d="M16 16C18.2091 16 20 14.2091 20 12C20 9.79086 18.2091 8 16 8C13.7909 8 12 9.79086 12 12C12 14.2091 13.7909 16 16 16Z" fill="#A78BFA"/>
        <path d="M8 24C8 20.6863 11.134 18 16 18C20.866 18 24 20.6863 24 24" fill="#A78BFA"/>
      </svg>
    </div>
  );
}
