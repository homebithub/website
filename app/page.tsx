import React from 'react';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import HousehelpsTable from './components/ui/HousehelpsTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden">
      <Navigation />
      <section className="container mx-auto px-2 sm:px-4 py-10 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-primary-800 mb-4 sm:mb-6 dark:text-primary-400">
            Everything you need for your home
          </h1>
          <p className="text-primary-700 max-w-2xl mx-auto text-base sm:text-lg dark:text-primary-200">
            We provide comprehensive home services with a focus on quality, reliability, and customer satisfaction.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-primary-700 text-xl sm:text-2xl font-semibold dark:text-primary-300">Why Choose Us</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="p-6 text-center">
              <div className="mb-4">
                <svg className="w-8 h-8 text-primary-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Expert Home Services</h3>
              <p className="text-gray-600 text-sm sm:text-base">Professional and reliable home maintenance and repair services.</p>
            </div>

            <div className="p-6 text-center">
              <div className="mb-4">
                <svg className="w-8 h-8 text-primary-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Skilled Technicians</h3>
              <p className="text-gray-600">Our team consists of certified and experienced professionals.</p>
            </div>

            <div className="p-6 text-center">
              <div className="mb-4">
                <svg className="w-8 h-8 text-primary-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Customer Support</h3>
              <p className="text-gray-600">24/7 customer support to assist you with any queries.</p>
            </div>

            <div className="p-6 text-center">
              <div className="mb-4">
                <svg className="w-8 h-8 text-primary-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Safe and secure payment processing for all services.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button className="bg-primary-600 text-white px-4 py-1 sm:px-6 rounded-xl hover:bg-primary-700 transition-colors duration-200 text-base sm:text-lg">
              Our Services
            </button>
            <button className="text-primary-600 px-4 py-1 sm:px-6 rounded-xl border border-primary-600 hover:bg-primary-50 transition-colors duration-200 text-base sm:text-lg">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-10 sm:py-16 dark:bg-slate-800">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 dark:text-primary-400">Available Professionals</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base dark:text-gray-300">
              Browse through our verified and skilled home assistants. Each profile has been thoroughly vetted to ensure quality and reliability.
            </p>
          </div>

          <HousehelpsTable />

          <div className="text-center mt-8 sm:mt-12">
            <button className="bg-primary-700 text-white px-4 py-1 sm:px-6 sm:py-1.5 rounded-xl hover:bg-primary-800 transition-colors duration-300 font-medium dark:bg-primary-600 dark:hover:bg-primary-700 text-base sm:text-lg">
              View All Profiles
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
