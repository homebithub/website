import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import type { MetaFunction } from "react-router";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { blogService } from "~/services/grpc/blog.service";

export const meta: MetaFunction = () => [
  { title: "Unsubscribe - Homebit Blog" },
];

export default function BlogUnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">(token ? "loading" : "idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    blogService.unsubscribeFromBlog(token)
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : "Unsubscribe failed.");
        setStatus("error");
      });
  }, [token]);

  return (
    <PurpleThemeWrapper>
      <Navigation />
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
              <p className="text-gray-600">Processing your unsubscribe request…</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">You've been unsubscribed</h1>
              <p className="text-gray-500">
                You will no longer receive blog update emails from Homebit.
                You can re-subscribe any time from our blog page.
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <Mail className="w-4 h-4" /> Back to blog
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
              <p className="text-gray-500">{errorMsg || "The unsubscribe link may be invalid or expired."}</p>
              <Link to="/blog" className="text-purple-600 underline text-sm">Back to blog</Link>
            </>
          )}

          {status === "idle" && (
            <>
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Missing token</h1>
              <p className="text-gray-500">The unsubscribe link appears to be incomplete. Please use the link from your email.</p>
              <Link to="/blog" className="text-purple-600 underline text-sm">Back to blog</Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </PurpleThemeWrapper>
  );
}
