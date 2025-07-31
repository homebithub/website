import React from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import Budget from '../components/Budget';

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Budget />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
