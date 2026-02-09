import React, { useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Error as ErrorComponent } from "~/components/Error";
import { Loading } from "~/components/Loading";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { API_BASE_URL } from '~/config/api';
import CustomSelect from '~/components/ui/CustomSelect';

interface ApiError {
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = formData.name.trim() !== "" && 
                      formData.email.trim() !== "" && 
                      formData.subject !== "" && 
                      formData.message.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json() as ApiError;
        const errorMessage = data.message || "Failed to send message";
        setError(errorMessage);
        return;
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="medium" className="flex-1">
      <main className="flex-1 container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
        <div className="max-w-lg mx-auto bg-white dark:bg-[#13131a] p-8 rounded-3xl shadow-light-glow-lg dark:shadow-glow-lg transition-all duration-500 hover:scale-105 hover:shadow-light-glow-lg dark:hover:shadow-glow-lg  border-2 border-purple-200/40 dark:border-purple-500/30">
          <div className="mb-8 text-center">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Contact Us 💬
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Have questions? We'd love to hear from you. 😊
            </p>
          </div>

          {error && <ErrorComponent title="Error" message={error} />}

          {success ? (
            <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-500/30 p-6 shadow-md">
              <div className="flex items-center justify-center">
                <span className="text-xl mr-3">🎉</span>
                <p className="text-lg font-bold text-green-800 dark:text-green-100">
                  Thank you for your message! We'll get back to you soon. ✔️
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="auth-input"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="auth-input"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2"
                >
                  Subject
                </label>
                <CustomSelect
                  value={formData.subject}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, subject: value }))
                  }
                  placeholder="Select a subject"
                  options={[
                    { value: "", label: "Select a subject" },
                    { value: "general", label: "General Inquiry" },
                    { value: "support", label: "Technical Support" },
                    { value: "billing", label: "Billing Question" },
                    { value: "feedback", label: "Feedback" },
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2"
                >
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="auth-input min-h-[120px]"
                />
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full px-8 py-1.5 rounded-xl font-bold text-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isFormValid
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                🚀 Send Message
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alternatively, you can reach us directly at{' '}
                  <a 
                    href="mailto:info@homebit.co.ke"
                    className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    info@homebit.co.ke
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
