import React, {useEffect, useState} from "react";
import {useSearchParams, useNavigate, useLocation} from "@remix-run/react";
import {ArrowLeftIcon, HeartIcon, TrashIcon, LockClosedIcon, LockOpenIcon} from "@heroicons/react/24/outline";

export default function HousehelpProfile() {
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [phone, setPhone] = useState<string>("");
    const [editingPhone, setEditingPhone] = useState(false);
    useEffect(() => {
        // Try to get phone from user_object in localStorage
        try {
            const userObj = JSON.parse(localStorage.getItem('user_object') || '{}');
            if (userObj && userObj.phone) setPhone(userObj.phone);
        } catch {}
    }, []);
    const [shortlistLoading, setShortlistLoading] = useState(false);
    const [shortlistDisabled, setShortlistDisabled] = useState(false);
    const [shortlistDisabledReason, setShortlistDisabledReason] = useState<string | null>(null);
    const [shortlisted, setShortlisted] = useState(false);

    const handleShortlist = async () => {
        if (!profileId) return;
        setShortlistLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not authenticated");
            const res = await fetch(`http://localhost:8080/api/v1/shortlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    profile_id: profileId,
                    profile_type: 'househelp',
                }),
            });
            if (!res.ok) {
                let errData;
                try {
                    errData = await res.json();
                } catch {
                    throw new Error('Failed to shortlist');
                }
                if (
                    res.status === 400 &&
                    errData.message === 'profile is currently unlocked and not expired'
                ) {
                    setShortlistDisabled(true);
                    setShortlisted(false);
                    setShortlistDisabledReason('This profile is currently unlocked and cannot be shortlisted until it expires.');
                    return;
                }
                throw new Error(errData.message || 'Failed to shortlist');
            }
            // Optionally, show success or update UI
            setShortlisted(true);
            setShortlistDisabled(true);
            setShortlistDisabledReason('You have already shortlisted this profile.');
        } catch (err: any) {
            if (!shortlistDisabled) alert(err.message || 'Failed to shortlist');
        } finally {
            setShortlistLoading(false);
        }
    };

    const [searchParams] = useSearchParams();
    const location = useLocation();
    const profileId = searchParams.get("profile_id");
    const tabParam = searchParams.get("tab");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unlockedContact, setUnlockedContact] = useState<{ phone?: string; email?: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Not authenticated");
                if (!profileId) throw new Error("No profile ID provided");
                // Check if already shortlisted
                const shortlistRes = await fetch(`http://localhost:8080/api/v1/shortlists/exists/${profileId}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (shortlistRes.ok) {
                    const shortlistData = await shortlistRes.json();
                    setShortlisted(!!shortlistData.exists);
                    if (shortlistData.exists) {
                        setShortlistDisabled(true);
                        setShortlistDisabledReason('You have already shortlisted this profile.');
                    } else {
                        setShortlistDisabled(false);
                        setShortlistDisabledReason(null);
                    }
                }
                // Track profile view
                await fetch(`http://localhost:8080/api/v1/profile-view/record`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        profile_id: profileId,
                        profile_type: 'househelp',
                    }),
                });
                // Fetch profile
                const res = await fetch(`http://localhost:8080/api/v1/househelps/${profileId}/profile_with_user`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (!res.ok) throw new Error("Failed to fetch househelp profile");
                const data = await res.json();
                setData(data.data);
            } catch (err: any) {
                setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileId]);

    if (loading) return <div className="flex justify-center py-12">Loading...</div>;
    if (error) return <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-6 text-center">{error}</div>;
    if (!data) return null;

    const {User, Househelp} = data;

    return (
        <>
          {showUnlockModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-md relative">
                <h2 className="text-lg font-bold mb-2 text-center text-primary-700">Unlock Contact</h2>
                <p className="mb-3 text-sm text-gray-700 dark:text-gray-200 text-center">
                  You are allowed to unlock up to 3 profiles. Make sure you go through the profile before you make a decision.<br />
                  <span className="font-semibold text-primary-700">We shall charge you KES 1000 for this.</span>
                </p>
                <div className="mb-3">
                  <label className="block text-xs mb-1 font-semibold">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 flex-1 text-sm"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      disabled={!editingPhone}
                    />
                    {!editingPhone ? (
                      <button
                        className="text-xs text-blue-600 underline"
                        onClick={() => setEditingPhone(true)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="text-xs text-green-600 underline"
                        onClick={() => setEditingPhone(false)}
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
      
                <table className="w-full mb-3 text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1">Service fee</td>
                      <td className="py-1 text-right">KES 500</td>
                    </tr>
                    <tr>
                      <td className="py-1">Househelp charge</td>
                      <td className="py-1 text-right">KES 500</td>
                    </tr>
                    <tr className="font-bold border-t">
                      <td className="py-1">Total</td>
                      <td className="py-1 text-right">KES 1000</td>
                    </tr>
                  </tbody>
                </table>
      
                <div className="mb-4 text-xs text-gray-500 dark:text-gray-300 text-center">
                  The househelp will be required to reimburse you if you hire them.
                </div>
      
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold"
                    onClick={() => setShowUnlockModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold shadow"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        if (!token) throw new Error('Not authenticated');
                        const res = await fetch(`http://localhost:8080/api/v1/shortlists/unlock`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ profile_id: profileId }),
                        });
                        if (!res.ok) throw new Error('Failed to unlock contact');
                        const data = await res.json();
                        setUnlockedContact(data);
                        setShowUnlockModal(false);
                      } catch (err: any) {
                        alert(err.message || 'Failed to unlock contact');
                      }
                    }}
                  >
                    <img src="/mpesa-logo.svg" alt="M-PESA" className="w-6 h-6" />
                    Pay with M-PESA
                  </button>
                </div>
              </div>
            </div>
          )}
      
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                if (tabParam === 'shortlist') {
                  navigate('/household/employment?tab=shortlist');
                } else {
                  navigate(-1);
                }
              }}
              className="p-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition"
              aria-label="Back"
            >
              <ArrowLeftIcon className="w-6 h-6 text-primary-700 dark:text-primary-300" />
            </button>
      
            <div className="flex flex-row gap-4 items-center group">
              {shortlisted ? (
                <>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow transition bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-400 ${shortlistLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    aria-label="Reject"
                    onClick={async () => {
                      setShortlistLoading(true);
                      try {
                        const token = localStorage.getItem('token');
                        if (!token) throw new Error('Not authenticated');
                        const res = await fetch(`http://localhost:8080/api/v1/shortlists/${profileId}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) {
                          const errData = await res.json();
                          throw new Error(errData.message || 'Failed to remove from shortlist');
                        }
      
                        setShortlisted(false);
                        setShortlistDisabled(false);
                        setShortlistDisabledReason(null);
      
                        const shortlistRes = await fetch(`http://localhost:8080/api/v1/shortlists/exists/${profileId}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        if (shortlistRes.ok) {
                          const shortlistData = await shortlistRes.json();
                          setShortlisted(!!shortlistData.exists);
                          if (shortlistData.exists) {
                            setShortlistDisabled(true);
                            setShortlistDisabledReason('You have already shortlisted this profile.');
                          } else {
                            setShortlistDisabled(false);
                            setShortlistDisabledReason(null);
                          }
                        }
                      } catch (err: any) {
                        alert(err.message || 'Failed to remove from shortlist');
                      } finally {
                        setShortlistLoading(false);
                      }
                    }}
                    disabled={shortlistLoading}
                    tabIndex={0}
                  >
                    <span>{shortlistLoading ? 'Removing...' : 'Reject'}</span>
                    <TrashIcon className="w-6 h-6" />
                  </button>
      
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold shadow transition bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-400 ml-2 text-base sm:text-lg"
                    aria-label="Unlock Contact"
                    onClick={() => setShowUnlockModal(true)}
                    tabIndex={0}
                  >
                    <span>View Contact</span>
                    {unlockedContact ? (
                      <LockOpenIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <LockClosedIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow transition
                      ${shortlistDisabled ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-400'}
                      ${shortlistLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    aria-label="Shortlist"
                    onClick={shortlistDisabled ? undefined : handleShortlist}
                    disabled={shortlistLoading || shortlistDisabled}
                    tabIndex={0}
                  >
                    <span>{shortlistLoading ? 'Shortlisting...' : 'Shortlist'}</span>
                    <HeartIcon className="w-6 h-6" />
                  </button>
                  {shortlistDisabled && shortlistDisabledReason && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-56 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 text-xs rounded px-3 py-2 shadow-lg z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                      {shortlistDisabledReason}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
      
          {/* User Information Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-8 sm:p-12 px-8 sm:px-16 md:px-24 relative w-full mx-2 sm:mx-6 md:mx-16 max-w-3xl flex flex-col items-center mb-8">
  <img
    src={Househelp.avatar_url || "https://placehold.co/96x96?text=HH"}
    alt={User.first_name}
    className="w-24 h-24 rounded-full object-cover bg-gray-200 mb-3"
  />
  <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
    {User.first_name} {User.last_name}
  </div>
  <div className="text-gray-500 dark:text-gray-300">{User.email}</div>
  <div className="text-gray-500 dark:text-gray-300">{User.phone}</div>
  <div className="flex gap-2 mt-2">
    {Househelp.verified && (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Verified</span>
    )}
            </div>
            <div className="text-gray-500 dark:text-gray-300">{User.email}</div>
            <div className="text-gray-500 dark:text-gray-300">{User.phone}</div>
            <div className="flex gap-2 mt-2">
              {Househelp.verified && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Verified</span>
              )}
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{User.country}</span>
            </div>
            {unlockedContact && (
              <div className="mt-2 flex flex-col items-center">
                <div className="text-lg font-bold text-purple-700">Phone: {unlockedContact.phone}</div>
                {unlockedContact.email && (
                  <div className="text-lg font-bold text-purple-700">Email: {unlockedContact.email}</div>
                )}
              </div>
            )}
            <div className="space-y-4 w-full max-w-2xl mx-auto text-xs text-left mt-6 text-gray-700 dark:text-gray-200">
              <div>
                <span className="font-semibold">Rating:</span> {Househelp.rating} ({Househelp.review_count} reviews)
              </div>
              <div>
                <span className="font-semibold">References:</span> {Househelp.references || '-'}
              </div>
              <div>
                <span className="font-semibold">Images:</span> {Househelp.images ? JSON.stringify(Househelp.images) : '-'}
              </div>
              <div>
                <span className="font-semibold">Created At:</span> {Househelp.created_at ? new Date(Househelp.created_at).toLocaleString() : '-'}
              </div>
            </div>
          </div>
        </>
      );
    }      
