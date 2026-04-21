import React from "react";
import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';

export const meta = () => [
  { title: "Cookie Policy — Homebit" },
  { name: "description", content: "Learn about how Homebit uses cookies to keep your account secure and your experience seamless." },
  { property: "og:title", content: "Cookie Policy — Homebit" },
  { property: "og:url", content: "https://homebit.co.ke/cookies" },
];

export default function Cookies() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <PurpleCard hover={false} glow={true} className="p-6 sm:p-8">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Cookie Policy
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Effective Date: 1 January 2026
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Last Updated: 14 March 2026
            </p>
            <p className="mt-4 text-slate-700 dark:text-slate-300">
              Homebit Hub Limited ("Homebit", "we", "us", or "our") uses cookies and similar technologies
              on our website https://homebit.co.ke (the "Platform"). This Cookie Policy explains what
              cookies we use, why we use them, and your choices regarding their use.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device (computer, phone, or tablet) when you
              visit a website. They help the website remember your actions and preferences so you don't
              have to re-enter them each time you visit.
            </p>

            <h2>2. Cookies We Use</h2>
            <p>
              We only use <strong>strictly necessary cookies</strong> that are essential for the Platform
              to function. We do <strong>not</strong> use advertising, marketing, or third-party tracking
              cookies.
            </p>

            <h3>2.1. Authentication Cookies</h3>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4">Cookie</th>
                  <th className="text-left py-2 pr-4">Purpose</th>
                  <th className="text-left py-2 pr-4">Duration</th>
                  <th className="text-left py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 pr-4"><code>access_token</code></td>
                  <td className="py-2 pr-4">Keeps you logged in to your account</td>
                  <td className="py-2 pr-4">Session / short-lived</td>
                  <td className="py-2">Essential</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>refresh_token</code></td>
                  <td className="py-2 pr-4">Renews your session without re-entering your password</td>
                  <td className="py-2 pr-4">30 days</td>
                  <td className="py-2">Essential</td>
                </tr>
              </tbody>
            </table>
            <p>
              These tokens are set as secure, HTTP-only cookies and cannot be read by JavaScript on the page.
              They are only sent over encrypted (HTTPS) connections.
            </p>

            <h3>2.2. Security Cookies</h3>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4">Storage</th>
                  <th className="text-left py-2 pr-4">Purpose</th>
                  <th className="text-left py-2 pr-4">Duration</th>
                  <th className="text-left py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 pr-4">Device fingerprint</td>
                  <td className="py-2 pr-4">Identifies your device so we can alert you when a new, unrecognised device logs in to your account</td>
                  <td className="py-2 pr-4">Persistent (localStorage)</td>
                  <td className="py-2">Essential / Security</td>
                </tr>
              </tbody>
            </table>
            <p>
              The device fingerprint is derived from your browser and device characteristics. It does not
              contain personal information. It is used solely to protect your account by detecting logins
              from new devices and prompting you to confirm them via email.
            </p>

            <h3>2.3. Preference Storage</h3>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4">Storage</th>
                  <th className="text-left py-2 pr-4">Purpose</th>
                  <th className="text-left py-2 pr-4">Duration</th>
                  <th className="text-left py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 pr-4">Theme preference</td>
                  <td className="py-2 pr-4">Remembers your light/dark mode choice</td>
                  <td className="py-2 pr-4">Persistent (localStorage)</td>
                  <td className="py-2">Functional</td>
                </tr>
              </tbody>
            </table>

            <h2>3. What We Do NOT Use</h2>
            <p>Homebit does <strong>not</strong> use:</p>
            <ul>
              <li>Advertising or marketing cookies</li>
              <li>Third-party tracking cookies (e.g., Google Ads, Facebook Pixel)</li>
              <li>Analytics cookies that identify individual users</li>
              <li>Cross-site tracking of any kind</li>
            </ul>

            <h2>4. Legal Basis</h2>
            <p>
              All cookies and local storage we use are <strong>strictly necessary</strong> for the
              Platform to function or to protect the security of your account. Under the Kenya Data
              Protection Act 2019, the EU ePrivacy Directive (Article 5(3)), and GDPR (Article 6(1)(f)),
              strictly necessary cookies do not require prior consent.
            </p>
            <p>
              Because we do not use non-essential cookies, we do not display a cookie consent banner.
              If we introduce analytics or marketing cookies in the future, we will update this policy
              and request your consent before setting those cookies.
            </p>

            <h2>5. Managing Cookies</h2>
            <p>
              You can delete or block cookies through your browser settings. Please note that
              disabling essential cookies will prevent you from logging in to your account.
            </p>
            <p>Common browser cookie settings:</p>
            <ul>
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/en-ke/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>

            <h2>6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this
              page with an updated effective date. Continued use of the Platform after changes are
              posted constitutes acceptance of the updated policy.
            </p>

            <h2>7. Related Policies</h2>
            <ul>
              <li>
                <Link to="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>

            <h2>8. Contact Us</h2>
            <p>
              If you have questions about this Cookie Policy, contact us at:<br />
              Email:{' '}
              <a href="mailto:info@homebit.co.ke" className="text-purple-600 dark:text-purple-400 hover:underline">
                info@homebit.co.ke
              </a>
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
