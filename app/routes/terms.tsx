import React from "react";
import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={true} bubbleDensity="low" className="flex-1">
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <PurpleCard hover={false} glow={true} className="p-6 sm:p-8">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Terms and Conditions
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Effective Date: 1 January 2026
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
            <p className="mt-4 text-slate-700 dark:text-slate-300">
              Welcome to Homebit ("Platform"), owned and operated by Homebit Hub Limited ("Homebit", "we", "us", or "our"), 
              a private limited company registered under the laws of Kenya. By accessing or using our website located at 
              https://homebit.co.ke, you agree to be bound by these Terms and Conditions ("Terms"). Please read them carefully.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Definitions</h2>
            <ul>
              <li>"User" refers to any individual or entity that accesses the Platform.</li>
              <li>"Household" refers to a User seeking to hire a domestic worker (househelp).</li>
              <li>"Househelp" refers to a domestic worker offering services to households.</li>
              <li>"Agency" refers to a third-party entity authorized to list househelps on behalf of candidates.</li>
              <li>"Services" means all services provided via the Platform, including listing, profile viewing, and communication tools.</li>
            </ul>

            <h2>2. Eligibility</h2>
            <p>
              To use the Platform, you must be at least 18 years of age and have the legal capacity to enter into a binding 
              agreement under Kenyan law.
            </p>

            <h2>3. Scope of Services</h2>
            <p>
              Homebit operates as an online marketplace connecting Households with Househelps. We do not employ househelps, 
              nor do we act as an agent or representative of either party. Homebit does not guarantee the quality, safety, 
              legality, or suitability of any Househelp or Household.
            </p>

            <h2>4. User Accounts</h2>
            <p>
              Users must register and maintain an active account to use the Platform. You agree to provide accurate, complete, 
              and current information at registration and keep it updated. You are solely responsible for all activities under 
              your account.
            </p>

            <h2>5. Payments and Fees</h2>
            <ul>
              <li>Househelps pay a listing fee upon profile submission.</li>
              <li>Households may view limited profile information for free. To access full profiles and contact information, 
              they must either purchase unlock credits or subscribe.</li>
              <li>All payments are processed through integrated third-party providers (e.g., M-Pesa, bank transfer).</li>
              <li>No commissions are charged on job placements.</li>
            </ul>

            <h2>6. Limited Background Checks</h2>
            <p>
              We perform limited ID verification and basic onboarding questionnaires for Househelps. We do not conduct in-depth 
              background or criminal checks and make no warranties regarding identity or qualifications.
            </p>

            <h2>7. Agencies</h2>
            <p>
              Homebit may allow verified agencies to upload and manage Househelp profiles. Agencies are solely responsible for 
              the accuracy and compliance of the profiles they manage.
            </p>

            <h2>8. Content and Data Use</h2>
            <p>
              By uploading content (e.g., photos, CVs, descriptions), you grant Homebit a non-exclusive, worldwide, royalty-free 
              license to use, display, and distribute such content in connection with the Platform.
            </p>

            <h2>9. Privacy</h2>
            <p>
              Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, store, and process 
              your personal data. This includes ID uploads and background documents which may be stored on third-party cloud 
              storage (e.g., AWS).
            </p>

            <h2>10. Refund Policy</h2>
            <p>
              Refunds are not guaranteed and may be granted at Homebit's sole discretion. If you believe you are entitled to a 
              refund, please contact us at info@homebit.co.ke.
            </p>

            <h2>11. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Provide false or misleading information;</li>
              <li>Use the Platform for illegal or unauthorized purposes;</li>
              <li>Harass, exploit, or abuse other Users;</li>
              <li>Upload harmful code or content;</li>
              <li>Circumvent any Platform limitations or access controls.</li>
            </ul>

            <h2>12. Disclaimer and Limitation of Liability</h2>
            <p>
              The Platform is provided "as is" and "as available." Homebit disclaims all warranties, express or implied. 
              Homebit shall not be liable for any indirect, incidental, or consequential damages arising from your use of 
              the Platform or services.
            </p>

            <h2>13. Dispute Resolution</h2>
            <p>
              Homebit does not mediate or resolve disputes between Households and Househelps. Users are encouraged to resolve 
              issues independently.
            </p>

            <h2>14. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Platform at any time, without notice, for 
              violation of these Terms.
            </p>

            <h2>15. Intellectual Property</h2>
            <p>
              All content, trademarks, and software on the Platform are the property of Homebit or its licensors. Users may 
              not copy, modify, or distribute any part of the Platform without express written permission.
            </p>

            <h2>16. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Platform constitutes your acceptance of the 
              revised Terms.
            </p>

            <h2>17. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of Kenya. Any disputes shall be subject 
              to the exclusive jurisdiction of the courts of Kenya.
            </p>

            <h2>18. Contact Information</h2>
            <p>
              For questions or support, contact us at:<br />
              Email: <a href="mailto:info@homebit.co.ke" className="text-purple-600 dark:text-purple-400 hover:underline">info@homebit.co.ke</a>
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
