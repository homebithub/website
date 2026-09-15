import { ShimmerLine } from "~/components/ShimmerLoader";

type LoadingVariant = "fullscreen" | "inline";

interface LoadingProps {
  text?: string;
  className?: string;
  variant?: LoadingVariant;
}

const containerVariants = {
  fullscreen: "min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06030a] via-[#090314] to-[#050109]",
  inline: "w-full min-h-56 flex items-center justify-center bg-[#0b0711]/80 rounded-2xl",
};

export function Loading({
  text = "Loading a delightful experience…",
  className = "",
  variant = "fullscreen",
}: LoadingProps) {
  const containerClasses = containerVariants[variant];

  return (
    <div className={`${containerClasses} ${className} relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-50" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-5">
        <div className="rounded-2xl border border-purple-300/15 bg-[#120b1c]/90 p-5 shadow-2xl shadow-black/25 backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-bold text-white">
              Home<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Bit</span>
            </h1>
            <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.7)]" />
          </div>
          <p className="mt-2 text-sm text-white/55">{text}</p>
          <div className="mt-5 space-y-2.5">
            <ShimmerLine width="92%" height={10} />
            <ShimmerLine width="70%" height={10} />
            <ShimmerLine width="46%" height={10} />
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
