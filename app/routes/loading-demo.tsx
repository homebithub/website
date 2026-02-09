import React, { useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Loading, Spinner, Dots, Pulse, Wave, Bounce, Ring } from "~/components/Loading";

export default function LoadingDemoPage() {
  const [selectedVariant, setSelectedVariant] = useState<'spinner' | 'dots' | 'pulse' | 'wave' | 'bounce' | 'ring'>('spinner');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [selectedColor, setSelectedColor] = useState<'primary' | 'secondary' | 'success' | 'warning' | 'error'>('primary');
  const [customText, setCustomText] = useState('Loading...');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 border-2 border-purple-500 dark:border-purple-400 rounded-xl bg-white dark:bg-black text-slate-900 dark:text-white shadow-card">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-primary-400 mb-8 text-center">
            Loading Component Demo
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                Customization Options
              </h2>
              
              {/* Variant Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Animation Variant
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['spinner', 'dots', 'pulse', 'wave', 'bounce', 'ring'].map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant as any)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedVariant === variant
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <div className="text-sm font-medium capitalize">{variant}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Size
                </label>
                <div className="flex space-x-3">
                  {['sm', 'md', 'lg', 'xl'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size as any)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Color
                </label>
                <div className="flex space-x-3">
                  {['primary', 'secondary', 'success', 'warning', 'error'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color as any)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full bg-${color}-500`} />
                        <span className="capitalize">{color}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                Preview
              </h2>
              
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
                <Loading
                  variant={selectedVariant}
                  size={selectedSize}
                  color={selectedColor}
                  text={customText}
                  fullScreen={false}
                />
              </div>

              {/* Code Preview */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">
                  Code Example
                </h3>
                <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-sm overflow-x-auto">
                  <code className="text-slate-800 dark:text-slate-200">
{`<Loading
  variant="${selectedVariant}"
  size="${selectedSize}"
  color="${selectedColor}"
  text="${customText}"
  fullScreen={false}
/>`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Individual Component Examples */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-primary-800 dark:text-primary-400 mb-8 text-center">
              Individual Component Examples
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Spinner</h3>
                <div className="flex justify-center">
                  <Spinner size="lg" color="primary" />
                </div>
                <pre className="mt-4 bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs">
                  <code>{`<Spinner size="lg" color="primary" />`}</code>
                </pre>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Dots</h3>
                <div className="flex justify-center">
                  <Dots size="lg" color="success" />
                </div>
                <pre className="mt-4 bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs">
                  <code>{`<Dots size="lg" color="success" />`}</code>
                </pre>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Pulse</h3>
                <div className="flex justify-center">
                  <Pulse size="lg" color="warning" />
                </div>
                <pre className="mt-4 bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs">
                  <code>{`<Pulse size="lg" color="warning" />`}</code>
                </pre>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Wave</h3>
                <div className="flex justify-center">
                  <Wave size="lg" color="error" />
                </div>
                <pre className="mt-4 bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs">
                  <code>{`<Wave size="lg" color="error" />`}</code>
                </pre>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Bounce</h3>
                <div className="flex justify-center">
                  <Bounce size="lg" color="secondary" />
                </div>
                <pre className="mt-4 bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs">
                  <code>{`<Bounce size="lg" color="secondary" />`}</code>
                </pre>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Ring</h3>
                <div className="flex justify-center">
                  <Ring size="lg" color="primary" />
                </div>
                <pre className="mt-4 bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs">
                  <code>{`<Ring size="lg" color="primary" />`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 