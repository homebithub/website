import React from 'react';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-100 py-8 mt-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <span className="font-bold text-lg">HomeXpress</span> &copy; {new Date().getFullYear()}
        </div>
        <div className="flex space-x-6">
          <Link to="/privacy" prefetch="viewport" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" prefetch="viewport" className="hover:underline">Terms of Service</Link>
          <Link to="/contact" prefetch="viewport" className="hover:underline">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
