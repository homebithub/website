import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '~/config/api';

export default function BureauHomeDashboard() {
  // Dummy data for dashboard
  const stats = [
    { label: "Househelps Registered", value: 42 },
    { label: "Households Served", value: 17 },
    { label: "Active Contracts", value: 8 },
    { label: "Completed Placements", value: 35 },
    { label: "Pending Applications", value: 5 },
    { label: "Commercial Partners", value: 3 },
    { label: "Revenue (This Month)", value: "KES 2,500" },
    { label: "Avg. Placement Time", value: "5 days" },
  ];

  // State for Onboard modal and OTP
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phone, setPhone] = useState("");

  // Add styles for phone input
  const phoneInputStyle = {
    color: '#1f2937', // Dark text color
    backgroundColor: '#f9fafb', // Light background
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    fontSize: '1rem',
  };
  const [otp, setOtp] = useState("");

  // State for bureau ID
  const [bureauId, setBureauId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch bureau profile to get bureau ID
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/v1/profile/bureau/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setBureauId(data.id || data._id || null);
      } catch {}
    };
    fetchProfile();
  }, []);

  // Placeholder handler functions
  const handleSendOtp = () => {
    // TODO: Integrate backend call to send OTP
    setShowOtpModal(true);
  };

  const handleResendOtp = () => {
    // TODO: Integrate backend call to resend OTP
    // Optionally show a message to the user
  };

  const handleVerifyOtp = () => {
    // TODO: Integrate backend call to verify OTP and onboard househelp
    setShowOnboardModal(false);
    setShowOtpModal(false);
    setPhone("");
    setOtp("");
    // Optionally update househelp list here
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-bold text-purple-600">Bureau Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#13131a] rounded-xl shadow dark:shadow-glow-sm border border-gray-100 dark:border-purple-500/30 p-4 sm:p-5 flex flex-col items-center transition-colors duration-300"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 mb-2">
              {stat.value}
            </div>
            <div className="text-gray-500  text-base text-center">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 ">Recent Activity</h3>
        <ul className="space-y-2">
          <li className="text-gray-500 ">Placed househelp Mary W. with household #1234</li>
          <li className="text-gray-500 ">Onboarded new househelp James K.</li>
          <li className="text-gray-500 ">Closed contract with commercial partner CleanCo</li>
          <li className="text-gray-500 ">Received 3 new applications today</li>
        </ul>
      </div>
      {/* Househelps Subsection */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-700  mb-4">Househelps</h3>
        {/* Placeholder for househelp list */}
        <div className="bg-white dark:bg-[#13131a] rounded-xl shadow dark:shadow-glow-sm border border-gray-100 dark:border-purple-500/30 p-4 text-gray-500 dark:text-gray-400 transition-colors duration-300">
          List of househelps will appear here.
        </div>
      </div>
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
