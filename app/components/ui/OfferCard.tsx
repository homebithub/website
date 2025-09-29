import React from "react";

interface OfferCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function OfferCard({ icon, title, description, className = "glow-card" }: OfferCardProps) {
  return (
    <div className={`${className} p-8 text-center flex flex-col items-center`}>
      <div className="flex-shrink-0 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
