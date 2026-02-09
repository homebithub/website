import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { FileText, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function HiringTermsAndConditions() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Hiring Terms & Conditions
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Last updated: November 27, 2025
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              Please read these terms carefully before sending or accepting a hire request on Homebit.
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">
            
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  1. Agreement to Terms
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  By sending or accepting a hire request through Homebit, you agree to be bound by these Hiring Terms and Conditions. These terms constitute a legally binding agreement between the household (employer) and the househelp (employee).
                </p>
                <p>
                  If you do not agree to these terms, you should not send or accept hire requests on our platform.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  2. Hire Request Process
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>2.1 Sending a Hire Request:</strong> Households can send hire requests to househelps through the platform. A hire request must include:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Job type (live-in, day-worker, part-time, or full-time)</li>
                  <li>Salary offered and payment frequency</li>
                  <li>Work schedule (days and times)</li>
                  <li>Optional: Preferred start date and special requirements</li>
                </ul>
                <p>
                  <strong>2.2 Accepting a Hire Request:</strong> Househelps may accept or decline hire requests. Acceptance creates a binding agreement between both parties.
                </p>
                <p>
                  <strong>2.3 Declining a Hire Request:</strong> Househelps may decline requests with a reason. Declined requests cannot be re-accepted.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  3. Employment Contract
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>3.1 Contract Creation:</strong> Once a hire request is accepted, the household may create an employment contract. This formalizes the employment relationship.
                </p>
                <p>
                  <strong>3.2 Contract Terms:</strong> The employment contract includes:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>All terms from the original hire request</li>
                  <li>Contract start date and optional end date</li>
                  <li>Additional notes or terms agreed upon by both parties</li>
                </ul>
                <p>
                  <strong>3.3 Contract Status:</strong> Contracts can be active, completed, or terminated. Both parties must maintain professional conduct throughout the contract period.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  4. Responsibilities & Obligations
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>4.1 Household Responsibilities:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Provide accurate job details and salary information</li>
                  <li>Honor the agreed-upon salary and payment schedule</li>
                  <li>Provide a safe working environment</li>
                  <li>Comply with all applicable labor laws and regulations</li>
                  <li>Treat the househelp with respect and dignity</li>
                </ul>
                <p className="mt-4">
                  <strong>4.2 Househelp Responsibilities:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Provide accurate profile information and qualifications</li>
                  <li>Perform duties as agreed in the hire request and contract</li>
                  <li>Maintain professional conduct at all times</li>
                  <li>Adhere to the agreed work schedule</li>
                  <li>Communicate any issues or concerns promptly</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  5. Termination
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>5.1 Termination Rights:</strong> Either party may terminate the employment contract with proper notice or for cause.
                </p>
                <p>
                  <strong>5.2 Termination Reasons:</strong> Valid reasons for termination include:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Mutual agreement</li>
                  <li>Breach of contract terms</li>
                  <li>Unsafe working conditions</li>
                  <li>Non-payment of agreed salary</li>
                  <li>Unprofessional conduct</li>
                </ul>
                <p>
                  <strong>5.3 Notice Period:</strong> Unless terminating for cause, parties should provide reasonable notice as agreed or required by law.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  6. Platform Role & Limitations
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>6.1 Facilitation Only:</strong> Homebit is a platform that facilitates connections between households and househelps. We are not a party to the employment relationship.
                </p>
                <p>
                  <strong>6.2 No Guarantees:</strong> Homebit does not guarantee:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>The accuracy of user-provided information</li>
                  <li>The quality of work or services provided</li>
                  <li>Payment or fulfillment of contract terms</li>
                  <li>Resolution of disputes between parties</li>
                </ul>
                <p>
                  <strong>6.3 User Responsibility:</strong> Users are responsible for:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Conducting their own due diligence</li>
                  <li>Verifying credentials and references</li>
                  <li>Ensuring compliance with local laws</li>
                  <li>Resolving disputes directly with the other party</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  7. Dispute Resolution
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>7.1 Direct Resolution:</strong> Parties are encouraged to resolve disputes directly through communication and negotiation.
                </p>
                <p>
                  <strong>7.2 Platform Support:</strong> While Homebit is not responsible for resolving disputes, we may provide:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Access to conversation history for reference</li>
                  <li>Documentation of hire requests and contracts</li>
                  <li>General guidance on platform features</li>
                </ul>
                <p>
                  <strong>7.3 Legal Recourse:</strong> For serious disputes, parties should seek appropriate legal counsel and follow local labor laws and regulations.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  8. Privacy & Data
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>8.1 Data Collection:</strong> Homebit collects and stores hire request and contract data to facilitate the hiring process.
                </p>
                <p>
                  <strong>8.2 Data Usage:</strong> Your hiring data may be used to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Display hire status in conversations</li>
                  <li>Track hiring history</li>
                  <li>Improve platform features</li>
                  <li>Provide customer support</li>
                </ul>
                <p>
                  <strong>8.3 Privacy:</strong> All data is handled in accordance with our Privacy Policy.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  9. Changes to Terms
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  Homebit reserves the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the hiring features after changes constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  10. Contact Information
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  For questions about these Hiring Terms and Conditions, please contact us at:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p><strong>Email:</strong> support@homexpert.co.ke</p>
                  <p><strong>Website:</strong> www.homexpert.co.ke</p>
                </div>
              </div>
            </section>

            {/* Acceptance Notice */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 mt-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
                    Acceptance of Terms
                  </h3>
                  <p className="text-purple-800 dark:text-purple-200">
                    By checking the "I accept the terms and conditions of hiring" box when sending or accepting a hire request, you acknowledge that you have read, understood, and agree to be bound by these Hiring Terms and Conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
