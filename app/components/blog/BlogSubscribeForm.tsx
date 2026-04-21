import { useState, useEffect } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { blogService } from "~/services/grpc/blog.service";

const SUB_KEY = (email: string) => `hb_blog_sub_${email.trim().toLowerCase()}`;

interface Props {
  variant?: "banner" | "inline" | "minimal";
  className?: string;
  defaultEmail?: string;
  defaultName?: string;
}

export function BlogSubscribeForm({ variant = "banner", className = "", defaultEmail = "", defaultName = "" }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // On mount: if we have a logged-in email, check localStorage cache
  useEffect(() => {
    if (!defaultEmail) return;
    setEmail(defaultEmail);
    try {
      if (localStorage.getItem(SUB_KEY(defaultEmail)) === "1") {
        setAlreadySubscribed(true);
      }
    } catch {}
  }, [defaultEmail]);

  useEffect(() => {
    if (defaultName) setName(defaultName);
  }, [defaultName]);

  function markSubscribed(addr: string) {
    try { localStorage.setItem(SUB_KEY(addr), "1"); } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await blogService.subscribeToBlog(email.trim(), name.trim() || undefined);
      markSubscribed(email.trim());
      if (res.alreadySubscribed) {
        setAlreadySubscribed(true);
      } else {
        setSuccess(true);
        setMessage(res.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Already subscribed — hide form, show status
  if (alreadySubscribed) {
    return (
      <div className={`flex flex-col items-center gap-3 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <p className="text-gray-900 dark:text-white font-semibold">You're already subscribed!</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          You'll be notified whenever a new post goes live.
          <br />
          To unsubscribe, use the link at the bottom of any blog email.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`flex flex-col items-center gap-3 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-gray-900 dark:text-white font-semibold">{message || "You're subscribed!"}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">We'll email you whenever a new post is published.</p>
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
          className="flex-1 px-3 py-2 rounded-lg border border-purple-500/30 bg-white/5 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
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
            className="flex-1 px-3 py-2 rounded-lg border border-purple-500/30 bg-white/5 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-3 py-2 rounded-lg border border-purple-500/30 bg-white/5 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /> Subscribe to new posts</>}
        </button>
      </form>
    );
  }

  // banner variant (default)
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-purple-700 to-pink-700 dark:from-purple-950/80 dark:to-pink-950/60 border border-white/20 dark:border-purple-500/20 p-8 ${className}`}>
      <div className="max-w-md mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Stay in the loop</h3>
        <p className="text-purple-100 dark:text-purple-200 text-xs mb-6">
          Get notified when we publish new articles about household management, home tips, and more.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white placeholder-white/60 dark:placeholder-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white placeholder-white/60 dark:placeholder-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          {error && (
            <p className="text-xs text-red-200 text-left">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-purple-700 font-semibold hover:bg-white/90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Mail className="w-5 h-5" /> Subscribe for free</>
            )}
          </button>
          <p className="text-xs text-white/60">No spam. Unsubscribe any time.</p>
        </form>
      </div>
    </div>
  );
}
