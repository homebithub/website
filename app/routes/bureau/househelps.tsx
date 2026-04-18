import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { bureauService, profileService as grpcProfileService } from '~/services/grpc/authServices';
import { getStoredAccessToken } from '~/utils/authStorage';

// Add phone input styles
const phoneInputStyle = {
  color: '#1f2937', // Dark text color
  backgroundColor: '#f9fafb', // Light background
  padding: '0.5rem',
  borderRadius: '0.5rem',
  border: '1px solid #e5e7eb',
  fontSize: '1rem',
};

export default function BureauHousehelps() {
  const [househelps, setHousehelps] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
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
        const token = getStoredAccessToken();
        if (!token) return;
        const data = await bureauService.getCurrentBureauProfile('');
        const resolvedBureauId = data?.id || data?._id || null;
        setBureauId(resolvedBureauId);

        if (resolvedBureauId) {
          setListLoading(true);
          const result = await grpcProfileService.getHousehelpsByBureau(resolvedBureauId, 20, 0);
          setHousehelps(Array.isArray(result?.data) ? result.data : []);
        }
      } catch {}
      finally {
        setListLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handlers
  const handleSearchPhone = async () => {
    setSearching(true);
    setSearchError("");
    setHousehelpInfo(null);
    try {
      const data = await grpcProfileService.searchHousehelpByPhone(phone);
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
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg border-2 border-purple-200 p-6 text-gray-600">
        {listLoading ? (
          <div>Loading bureau househelps...</div>
        ) : listError ? (
          <div className="text-red-600">{listError}</div>
        ) : househelps.length === 0 ? (
          <div>No househelps are currently linked to this bureau.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-purple-200 text-left text-gray-700">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {househelps.map((item: any) => (
                  <tr key={item?.Househelp?.id || item?.User?.id} className="border-b border-purple-100 last:border-b-0">
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {[item?.User?.first_name, item?.User?.last_name].filter(Boolean).join(' ') || 'Unnamed househelp'}
                    </td>
                    <td className="py-2 pr-4">{item?.User?.phone || '-'}</td>
                    <td className="py-2 pr-4">{item?.Househelp?.current_location || item?.Househelp?.location || '-'}</td>
                    <td className="py-2 pr-4">{item?.User?.status || item?.Househelp?.profile_status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Onboard Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={handleCloseModal} />
          <div className="relative bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl p-8 w-full sm:max-w-lg shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-slide-up sm:mx-4">
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
                  style={phoneInputStyle}
                />
                {!househelpInfo && (
                  <button
                    className="btn-primary w-full py-1.5 text-lg mb-2"
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
                    <div>Name: {[househelpInfo?.User?.first_name, househelpInfo?.User?.last_name].filter(Boolean).join(' ') || househelpInfo.name || househelpInfo.first_name || "-"}</div>
                    <div>Phone: {househelpInfo?.User?.phone || househelpInfo.phone || '-'}</div>
                  </div>
                )}
                {househelpInfo && (
                  <button
                    className="btn-secondary w-full py-1.5 text-lg"
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

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
