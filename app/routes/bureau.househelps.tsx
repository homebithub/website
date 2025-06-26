import React, { useState, useEffect } from "react";
import { Link } from "@remix-run/react";

export default function BureauHousehelps() {
  // State for Onboard modal and OTP
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [househelpInfo, setHousehelpInfo] = useState<any>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  // State for bureau ID
  const [bureauId, setBureauId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch bureau profile to get bureau ID
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:8080/api/v1/profile/bureau/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setBureauId(data.id || data._id || null);
      } catch {}
    };
    fetchProfile();
  }, []);

  // Handlers
  const handleSearchPhone = async () => {
    setSearching(true);
    setSearchError("");
    setHousehelpInfo(null);
    // TODO: Replace with real API endpoint
    try {
      // Simulate API call
      const res = await fetch(`http://localhost:8080/api/v1/househelp/lookup?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error("No househelp found with this number");
      const data = await res.json();
      setHousehelpInfo(data);
    } catch (err: any) {
      setSearchError(err.message || "No househelp found with this number");
    } finally {
      setSearching(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setOtpError("");
    // TODO: Replace with real API endpoint
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowOtpModal(true);
    } catch (err: any) {
      setOtpError("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = () => {
    handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    // TODO: Integrate backend call to verify OTP and onboard househelp
    setShowOnboardModal(false);
    setShowOtpModal(false);
    setPhone("");
    setOtp("");
    setHousehelpInfo(null);
  };

  const handleCloseModal = () => {
    setShowOnboardModal(false);
    setShowOtpModal(false);
    setPhone("");
    setOtp("");
    setHousehelpInfo(null);
    setSearchError("");
    setOtpError("");
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-bold text-primary dark:text-primary-300">Househelps</h2>
      <div className="flex items-center justify-between mb-4 mt-6">
        <div className="text-gray-500 dark:text-gray-300">Manage househelps registered with your bureau.</div>
        <div className="flex gap-2">
          {bureauId && (
            <Link
              to={`/signup?bureauId=${bureauId}`}
              className="btn-primary flex items-center justify-center"
            >
              Create New (Househelp)
            </Link>
          )}
          <button
            className="btn-secondary"
            onClick={() => setShowOnboardModal(true)}
          >
            Onboard
          </button>
        </div>
      </div>
      {/* Placeholder for househelp list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 p-4 text-gray-500 dark:text-gray-300">
        List of househelps will appear here.
      </div>
      {/* Onboard Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h4 className="text-xl font-bold mb-6 text-primary-700 dark:text-primary-300">Onboard Existing Househelp</h4>
            {!showOtpModal ? (
              <>
                <label className="block mb-3 text-base font-medium">Phone Number</label>
                <input
                  type="tel"
                  className="input-primary mb-4 w-full text-lg px-4 py-3"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={searching || !!househelpInfo}
                />
                {!househelpInfo && (
                  <button
                    className="btn-primary w-full py-3 text-lg mb-2"
                    onClick={handleSearchPhone}
                    disabled={searching || !phone}
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                )}
                {searchError && <div className="text-red-600 mb-2 text-center">{searchError}</div>}
                {househelpInfo && (
                  <div className="mb-4 p-4 rounded bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200">
                    <div className="font-semibold">Househelp Found:</div>
                    <div>Name: {househelpInfo.name || househelpInfo.first_name || "-"}</div>
                    <div>Phone: {househelpInfo.phone}</div>
                  </div>
                )}
                {househelpInfo && (
                  <button
                    className="btn-secondary w-full py-3 text-lg"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                )}
                {otpError && <div className="text-red-600 mb-2 text-center">{otpError}</div>}
              </>
            ) : (
              <>
                <label className="block mb-3 text-base font-medium">Enter OTP</label>
                <input
                  type="text"
                  className="input-primary mb-4 w-full text-lg px-4 py-3"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                />
                <div className="flex gap-2 justify-between items-center mb-2">
                  <button className="text-primary-600 text-base underline" onClick={handleResendOtp} disabled={sendingOtp}>
                    Resend OTP
                  </button>
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                    <button className="btn-primary" onClick={handleVerifyOtp} disabled={!otp}>
                      Verify
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
