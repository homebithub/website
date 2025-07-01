import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function HouseholdProfile() {
  const [searchParams] = useSearchParams();
  const profileId = searchParams.get("profile_id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        if (!profileId) throw new Error("No profile ID provided");
        const res = await fetch(`http://localhost:8080/api/v1/househelps/${profileId}/profile_with_user`, {
          headers: { Authorization: `Bearer ${token}` },
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

  const { User, Househelp } = data;

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition" aria-label="Back">
          <ArrowLeftIcon className="w-6 h-6 text-primary-700 dark:text-primary-300" />
        </button>
        <span className="text-xl font-bold text-primary dark:text-primary-300">Househelp Profile</span>
        <button className="p-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition" aria-label="Lock">
          <LockClosedIcon className="w-6 h-6 text-primary-700 dark:text-primary-300" />
        </button>
      </div>
      {/* User Info Section */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={Househelp.avatar_url || "https://placehold.co/96x96?text=HH"}
          alt={User.first_name}
          className="w-24 h-24 rounded-full object-cover bg-gray-200 mb-3"
        />
        <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">{User.first_name} {User.last_name}</div>
        <div className="text-gray-500 dark:text-gray-300">{User.email}</div>
        <div className="text-gray-500 dark:text-gray-300">{User.phone}</div>
        <div className="flex gap-2 mt-2">
          {Househelp.verified && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Verified</span>}
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{User.country}</span>
        </div>
      </div>
      {/* Househelp Profile Section */}
      <div className="space-y-4">
        <div>
          <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Bio</span>
          <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.bio || '-'}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex-1">
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Status</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.status}</span>
          </div>
          <div className="flex-1">
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Experience</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.experience} years</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex-1">
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Skills</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.skills && Househelp.skills.length ? Househelp.skills.join(', ') : '-'}</span>
          </div>
          <div className="flex-1">
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Specialities</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.specialities && Househelp.specialities.length ? Househelp.specialities.join(', ') : '-'}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex-1">
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Languages</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.languages && Househelp.languages.length ? Househelp.languages.join(', ') : '-'}</span>
          </div>
          <div className="flex-1">
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Salary Expectation</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.salary_expectation ? `${Househelp.salary_expectation} (${Househelp.salary_frequency})` : '-'}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex-1">
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Rating</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.rating} ({Househelp.review_count} reviews)</span>
          </div>
          <div className="flex-1">
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">National ID No</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.national_id_no || '-'}</span>
          </div>
        </div>
        <div>
          <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Address</span>
          <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.address || '-'}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">References</span>
          <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.references ? Househelp.references : '-'}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Created At</span>
          <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.created_at ? new Date(Househelp.created_at).toLocaleString() : '-'}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Updated At</span>
          <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Househelp.updated_at ? new Date(Househelp.updated_at).toLocaleString() : '-'}</span>
        </div>
      </div>
    </div>
  );
}


