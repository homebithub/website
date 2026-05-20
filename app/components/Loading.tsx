import React from "react";
import { ShimmerHeroPanel, ShimmerSection, ShimmerTileRow } from "~/components/ShimmerLoader";

type LoadingVariant = "fullscreen" | "inline";

interface LoadingProps {
  text?: string;
  className?: string;
  variant?: LoadingVariant;
}

const containerVariants = {
  fullscreen: "min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06030a] via-[#090314] to-[#050109]",
  inline: "w-full h-full flex items-center justify-center bg-gradient-to-br from-[#06030a] via-[#090314] to-[#050109] rounded-3xl",
};

export function Loading({
  text = "Loading a delightful experience…",
  className = "",
  variant = "fullscreen",
}: LoadingProps) {
  const containerClasses = containerVariants[variant];

  return (
    <div className={`${containerClasses} ${className} relative overflow-hidden bg-[#05020b]`}> 
      <div className="absolute inset-0 opacity-60" aria-hidden>
        <div className="absolute -top-32 -left-10 w-[480px] h-[480px] rounded-full bg-purple-500/10 blur-[140px]" />
        <div className="absolute top-16 right-0 w-[420px] h-[420px] rounded-full bg-pink-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 text-white/70 w-full max-w-5xl px-6">
        <div className="text-center">
          <p className="text-[0.8rem] uppercase tracking-[0.4em] text-white/40 mb-2">{text}</p>
          <h1 className="text-2xl font-bold text-white">
            Home<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Bit</span>
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <ShimmerHeroPanel />
            <ShimmerTileRow items={2} />
          </div>
          <div className="space-y-4">
            <ShimmerSection lines={4} showAction />
            <ShimmerSection lines={3} showTitle={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FullscreenLoading({ text = "Loading a delightful experience…", className = "" }: Omit<LoadingProps, "variant">) {
  return <Loading text={text} className={className} variant="fullscreen" />;
}

export function InlineShimmer({ text = "Loading…", className = "" }: Omit<LoadingProps, "variant">) {
  return <Loading text={text} className={className} variant="inline" />;
}