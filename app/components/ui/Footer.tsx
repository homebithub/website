import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-100 py-8 mt-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <span className="font-bold text-lg">HomeXpress</span> &copy; {new Date().getFullYear()}
        </div>
        <div className="flex space-x-6">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="/terms" className="hover:underline">Terms of Service</a>
          <a href="mailto:support@homexpress.com" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
