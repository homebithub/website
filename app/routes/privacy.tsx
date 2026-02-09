import React from "react";
import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <PurpleCard hover={false} glow={true} className="p-6 sm:p-8">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Privacy Statement
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Effective Date: 1 January 2026
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Last Updated: 5 February 2026
            </p>
            <p className="mt-4 text-slate-700 dark:text-slate-300">
              Homebit Hub Limited ("Homebit", "we", "us", or "our") is committed to protecting your personal data and 
              your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you visit our website https://homebit.co.ke (the "Platform").
            </p>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              By using the Platform, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Information We Collect</h2>
            <p>We collect several types of information to provide and improve our services:</p>
            
            <h3>1.1. Personal Information:</h3>
            <ul>
              <li>Full Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>National ID or Passport Number</li>
              <li>Profile photograph</li>
              <li>Residential location or preferred working areas</li>
              <li>CV, references, and bio-data</li>
            </ul>

            <h3>1.2. Usage Data:</h3>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Time and date of visit</li>
              <li>Pages visited and actions taken</li>
            </ul>

            <h3>1.3. Payment Information:</h3>
            <p>
              We do not store payment card or M-Pesa PIN information. Payments are processed by third-party providers 
              (e.g., M-Pesa, banks).
            </p>

            <h3>1.4. Uploaded Content:</h3>
            <p>
              Photos, resumes, certifications, or identification documents provided during registration.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>We use collected data for the following purposes:</p>
            <ul>
              <li>To operate and maintain the Platform</li>
              <li>To create and manage your account</li>
              <li>To verify identity (e.g., for househelps)</li>
              <li>To match Households with suitable Househelps</li>
              <li>To process payments</li>
              <li>To respond to user inquiries or support requests</li>
              <li>To send service-related notifications</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>3. Data Storage and Security</h2>
            <ul>
              <li>All user-uploaded documents are securely stored using cloud services, such as Amazon Web Services (AWS).</li>
              <li>Access to your information is restricted to authorized Homebit staff and is protected with encryption, 
              access controls, and secure connections.</li>
              <li>We implement administrative, technical, and physical safeguards to protect your information.</li>
            </ul>

            <h2>4. Sharing and Disclosure</h2>
            <p>We do not sell, rent, or trade your personal information. We may share your information:</p>
            <ul>
              <li>With trusted third-party service providers (e.g., hosting, payments, customer support)</li>
              <li>If required by law, court order, or governmental regulation</li>
              <li>To enforce our Terms and Conditions or protect rights and safety</li>
            </ul>

            <h2>5. Cookies and Tracking Technologies</h2>
            <p>We may use cookies and similar technologies to:</p>
            <ul>
              <li>Understand how users navigate the Platform</li>
              <li>Remember user preferences</li>
              <li>Improve site performance and user experience</li>
            </ul>
            <p>Users can control cookie preferences through their browser settings.</p>

            <h2>6. User Rights</h2>
            <p>As a user, you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and data (subject to legal obligations)</li>
              <li>Withdraw consent where applicable</li>
            </ul>
            <p>
              To exercise these rights, please email us at{' '}
              <a href="mailto:info@homebit.co.ke" className="text-purple-600 dark:text-purple-400 hover:underline">
                info@homebit.co.ke
              </a>.
            </p>

            <h2>7. Data Retention</h2>
            <p>We retain personal data as long as your account is active or as needed to:</p>
            <ul>
              <li>Provide services</li>
              <li>Comply with legal, tax, or regulatory requirements</li>
              <li>Resolve disputes and enforce agreements</li>
            </ul>

            <h2>8. Third-Party Services</h2>
            <p>
              Our Platform may contain links to external websites. We are not responsible for the content or privacy 
              practices of third-party sites. Please review their respective privacy policies.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not directed at children under the age of 18. We do not knowingly collect personal data 
              from anyone under this age.
            </p>

            <h2>10. Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. All changes will be posted on this page with an 
              updated effective date. Continued use of the Platform indicates acceptance of these changes.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, contact us at:<br />
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
