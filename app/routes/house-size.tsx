import React from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import HouseSize from '../components/modals/HouseSize';

export default function HouseSizePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HouseSize />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
