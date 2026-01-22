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
      <main className="container mx-auto px-4 py-8">
        <PurpleCard hover={false} glow={true} className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and
              provision of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or
              software) on Homebit's website for personal, non-commercial transitory viewing only.
            </p>

            <h2>3. User Account</h2>
            <p>
              To access certain features of the website, you may be required to create an account. You
              are responsible for maintaining the confidentiality of your account and password.
            </p>

            <h2>4. Job Postings and Applications</h2>
            <p>
              Users may post job listings and submit applications through our platform. All content
              must be accurate and comply with applicable laws and regulations.
            </p>

            <h2>5. Privacy Policy</h2>
            <p>
              Your use of this website is also governed by our Privacy Policy. Please review our
              Privacy Policy, which also governs the site and informs users of our data collection
              practices.
            </p>

            <h2>6. Disclaimer</h2>
            <p>
              The materials on Homebit's website are provided on an 'as is' basis. Homebit makes
              no warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of intellectual
              property or other violation of rights.
            </p>

            <h2>7. Limitations</h2>
            <p>
              In no event shall Homebit or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business interruption)
              arising out of the use or inability to use the materials on Homebit's website.
            </p>

            <h2>8. Revisions and Errata</h2>
            <p>
              The materials appearing on Homebit's website could include technical, typographical,
              or photographic errors. Homebit does not warrant that any of the materials on its
              website are accurate, complete, or current.
            </p>

            <h2>9. Links</h2>
            <p>
              Homebit has not reviewed all of the sites linked to its website and is not
              responsible for the contents of any such linked site. The inclusion of any link does not
              imply endorsement by Homebit of the site.
            </p>

            <h2>10. Modifications</h2>
            <p>
              Homebit may revise these terms of service for its website at any time without notice.
              By using this website, you are agreeing to be bound by the then current version of these
              terms of service.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
