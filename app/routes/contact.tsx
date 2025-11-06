import React, { useState } from "react";
import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Error as ErrorComponent } from "~/components/Error";
import { Loading } from "~/components/Loading";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { API_ENDPOINTS } from '~/config/api';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.contact, {
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
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="medium">
      <main className="flex-1 container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
        <div className="max-w-4xl mx-auto bg-white/90 dark:bg-[#13131a]/95 p-8 rounded-3xl shadow-light-glow-lg dark:shadow-glow-lg backdrop-blur-lg transition-all duration-500 hover:scale-105 hover:shadow-light-glow-lg dark:hover:shadow-glow-lg fade-in-scroll border-2 border-purple-200/40 dark:border-purple-500/30">
          <div className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Contact Us 💬
            </h1>
            <p className="text-lg text-gray-600">
              Have questions? We'd love to hear from you. 😊
            </p>
          </div>

          {error && <ErrorComponent title="Error" message={error} />}

          {success ? (
            <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 shadow-md">
              <div className="flex items-center justify-center">
                <span className="text-3xl mr-3">🎉</span>
                <p className="text-lg font-bold text-green-800">
                  Thank you for your message! We'll get back to you soon. ✔️
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-purple-700 mb-2"
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
                      className="block text-sm font-semibold text-purple-700 mb-2"
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
                      className="block text-sm font-semibold text-purple-700 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      name="subject"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="auth-input"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-purple-700 mb-2"
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
                    className="w-full px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    🚀 Send Message
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Contact Information
                  </h3>
                  <div className="mt-4 space-y-4">
                    <p className="text-gray-600">
                      <strong>Address:</strong>
                      <br />
                      123 Main Street
                      <br />
                      City, State, ZIP
                    </p>
                    <p className="text-gray-600">
                      <strong>Email:</strong>
                      <br />
                      contact@homebit.com
                    </p>
                    <p className="text-gray-600">
                      <strong>Phone:</strong>
                      <br />
                      (555) 123-4567
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Business Hours
                  </h3>
                  <div className="mt-4 space-y-2">
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM
                    </p>
                    <p className="text-gray-600">
                      Saturday: 10:00 AM - 4:00 PM
                    </p>
                    <p className="text-gray-600">
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
