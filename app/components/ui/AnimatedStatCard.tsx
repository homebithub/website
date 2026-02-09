import React from "react";

interface AnimatedStatCardProps {
  name: string;
  value: string;
}

const AnimatedStatCard = ({ name, value }: AnimatedStatCardProps) => {
  const [displayValue, setDisplayValue] = React.useState("0");
  React.useEffect(() => {
    // Extract numeric part and suffix (e.g. '+', '%')
    const match = value.match(/([\d,]+)([+%]*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }
    const rawNum = match[1].replace(/,/g, "");
    const num = parseInt(rawNum, 10);
    const suffix = match[2] || "";
    const duration = 1200; // ms
    const steps = 40;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        setDisplayValue(num.toLocaleString() + suffix);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current).toLocaleString() + suffix);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div className="flex flex-col bg-slate-50 p-8 dark:bg-slate-800 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
      <dt className="text-sm font-semibold leading-6 text-slate-600 dark:text-gray-300">{name}</dt>
      <dd className="order-first text-xl font-semibold tracking-tight text-slate-900 dark:text-primary-200 animate-pulse">
        {displayValue}
      </dd>
    </div>
  );
};

export default AnimatedStatCard;
