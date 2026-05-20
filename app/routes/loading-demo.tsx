import React, { useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Loading, InlineShimmer } from "~/components/Loading";
import { ShimmerHeroPanel, ShimmerSection, ShimmerTileRow, ShimmerListPlaceholder } from "~/components/ShimmerLoader";

type DemoVariant = "fullscreen" | "inline";

export default function LoadingDemoPage() {
  const [variant, setVariant] = useState<DemoVariant>("inline");
  const [customText, setCustomText] = useState("Loading a delightful experience…");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 border-2 border-purple-500 dark:border-purple-400 rounded-xl bg-white dark:bg-black text-slate-900 dark:text-white shadow-card">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-primary-800 dark:text-primary-400 mb-8 text-center">
            Shimmer Loading Demo
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                Customization Options
              </h2>

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Layout Variant
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["inline", "fullscreen"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setVariant(item as DemoVariant)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        variant === item
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                          : "border-gray-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600"
                      }`}
                    >
                      <div className="text-xs font-medium capitalize">{item}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Custom Text
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter custom loading text..."
                />
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                Preview
              </h2>
              
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden">
                {variant === "fullscreen" ? (
                  <div className="w-full h-[380px] border border-slate-800 rounded-2xl overflow-hidden">
                    <Loading text={customText} variant="fullscreen" />
                  </div>
                ) : (
                  <div className="w-full px-6 py-10">
                    <InlineShimmer text={customText} />
                  </div>
                )}
              </div>

              {/* Code Preview */}
              <div className="mt-6">
                <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-3">
                  Code Example
                </h3>
                <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-xs overflow-x-auto">
                  <code className="text-slate-800 dark:text-slate-200">
{variant === "fullscreen"
  ? `<Loading text="${customText}" variant="fullscreen" />`
  : `<InlineShimmer text="${customText}" />`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Shimmer building blocks */}
          <div className="mt-12">
            <h2 className="text-lg font-bold text-primary-800 dark:text-primary-400 mb-8 text-center">
              Shimmer Building Blocks
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Hero shimmer</h3>
                <ShimmerHeroPanel />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Tile row</h3>
                <ShimmerTileRow items={3} />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Content section</h3>
                <ShimmerSection lines={5} showAction />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Inline shimmer</h3>
                <InlineShimmer text="Loading recent updates…" />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">List placeholder</h3>
                <ShimmerListPlaceholder items={2} />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Section stack</h3>
                <div className="space-y-3">
                  <ShimmerSection lines={3} />
                  <ShimmerSection lines={4} showTitle={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 