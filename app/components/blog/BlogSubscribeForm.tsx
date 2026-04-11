import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { blogService } from "~/services/grpc/blog.service";

interface Props {
  variant?: "banner" | "inline" | "minimal";
  className?: string;
}

export function BlogSubscribeForm({ variant = "banner", className = "" }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await blogService.subscribeToBlog(email.trim(), name.trim() || undefined);
      setSuccess(true);
      setMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={`flex flex-col items-center gap-3 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-400" />
        </div>
        <p className="text-white font-semibold">{message || "You're subscribed!"}</p>
        <p className="text-sm text-gray-400">We'll email you whenever a new post is published.</p>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-3 py-2 rounded-lg border border-purple-500/30 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
        </button>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </form>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="flex-1 px-3 py-2 rounded-lg border border-purple-500/30 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-3 py-2 rounded-lg border border-purple-500/30 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /> Subscribe to new posts</>}
        </button>
      </form>
    );
  }

  // banner variant (default)
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/20 border border-purple-500/20 p-8 backdrop-blur-sm ${className}`}>
      <div className="max-w-md mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Stay in the loop</h3>
        <p className="text-gray-400 text-sm mb-6">
          Get notified when we publish new articles about household management, home tips, and more.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-3 rounded-xl border border-purple-500/30 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 rounded-xl border border-purple-500/30 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          {error && (
            <p className="text-xs text-red-400 text-left">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Mail className="w-5 h-5" /> Subscribe for free</>
            )}
          </button>
          <p className="text-xs text-gray-500">No spam. Unsubscribe any time.</p>
        </form>
      </div>
    </div>
  );
}
