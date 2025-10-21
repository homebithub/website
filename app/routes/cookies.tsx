import React from "react";
import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';

export default function Cookies() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={true} bubbleDensity="low" className="flex-1">
      <main className="container mx-auto px-4 py-8">
        <PurpleCard hover={false} glow={true} className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Cookie Policy
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you
              visit a website. They are widely used to make websites work more efficiently and provide
              a better user experience.
            </p>

            <h2>2. How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul>
              <li>
                <strong>Essential Cookies:</strong> These cookies are necessary for the website to
                function properly. They enable basic functions like page navigation and access to
                secure areas of the website.
              </li>
              <li>
                <strong>Preference Cookies:</strong> These cookies enable the website to remember
                information that changes the way the website behaves or looks, like your preferred
                language or the region you are in.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> These cookies help us understand how visitors
                interact with our website by collecting and reporting information anonymously.
              </li>
              <li>
                <strong>Marketing Cookies:</strong> These cookies are used to track visitors across
                websites. The intention is to display ads that are relevant and engaging for the
                individual user.
              </li>
            </ul>

            <h2>3. Types of Cookies We Use</h2>
            <p>We use the following types of cookies:</p>
            <ul>
              <li>
                <strong>Session Cookies:</strong> These cookies are temporary and are deleted when you
                close your browser.
              </li>
              <li>
                <strong>Persistent Cookies:</strong> These cookies remain on your device for a set
                period of time or until you delete them.
              </li>
              <li>
                <strong>First-Party Cookies:</strong> These cookies are set by our website and can
                only be read by our website.
              </li>
              <li>
                <strong>Third-Party Cookies:</strong> These cookies are set by a third-party service
                that appears on our website.
              </li>
            </ul>

            <h2>4. Managing Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings preferences.
              However, limiting cookies may impact your experience using our website. To learn more
              about cookies and how to manage them, visit{" "}
              <a
                href="https://www.aboutcookies.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 dark:text-teal-400 hover:underline"
              >
                AboutCookies.org
              </a>
              .
            </p>

            <h2>5. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We use the
              following third-party services:
            </p>
            <ul>
              <li>Google Analytics for website analytics</li>
              <li>Google Ads for advertising</li>
              <li>Facebook Pixel for social media tracking</li>
              <li>LinkedIn Insight for professional networking</li>
            </ul>

            <h2>6. Updates to This Policy</h2>
            <p>
              We may update this cookie policy from time to time. We will notify you of any changes by
              posting the new policy on this page.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about our cookie policy, please contact us at:
              <br />
              Email: privacy@homebit.com
              <br />
              Address: 123 Main Street, City, State, ZIP
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
        </PurpleCard>
      </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
} 
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
