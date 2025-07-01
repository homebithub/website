import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function HousehelpProfile() {
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
    <div className="w-full flex justify-center bg-transparent mt-4 sm:mt-2">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-8 sm:p-12 px-8 sm:px-16 md:px-24 relative w-full mx-2 sm:mx-6 md:mx-16 max-w-5xl">
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
      {/* User Information Section */}
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
      {/* Househelp Profile Information Section */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl mx-auto text-xs text-left">
          {/* <div><span className="font-semibold">Bureau ID:</span> {Househelp.bureau_id}</div> */}
          <div><span className="font-semibold">Bio:</span> {Househelp.bio || '-'}</div>
          <div><span className="font-semibold">Address:</span> {Househelp.address || '-'}</div>
          <div><span className="font-semibold">Experience:</span> {Househelp.experience} years</div>
          <div><span className="font-semibold">Skills:</span> {Househelp.skills && Househelp.skills.length ? Househelp.skills.join(', ') : '-'}</div>
          <div><span className="font-semibold">Specialities:</span> {Househelp.specialities && Househelp.specialities.length ? Househelp.specialities.join(', ') : '-'}</div>
          <div><span className="font-semibold">Languages:</span> {Househelp.languages && Househelp.languages.length ? Househelp.languages.join(', ') : '-'}</div>
          <div><span className="font-semibold">Hourly Rate:</span> {Househelp.hourly_rate ? Househelp.hourly_rate : '-'}</div>
          <div><span className="font-semibold">Salary Expectation:</span> {Househelp.salary_expectation ? `${Househelp.salary_expectation} (${Househelp.salary_frequency})` : '-'}</div>
           
          <div><span className="font-semibold">Rating:</span> {Househelp.rating} ({Househelp.review_count} reviews)</div>
          <div><span className="font-semibold">References:</span> {Househelp.references ? Househelp.references : '-'}</div>
          <div><span className="font-semibold">Images:</span> {Househelp.images ? JSON.stringify(Househelp.images) : '-'}</div>
          <div><span className="font-semibold">Created At:</span> {Househelp.created_at ? new Date(Househelp.created_at).toLocaleString() : '-'}</div>
         
        </div>
      </div>

          {/* All fields already rendered above in grid sections. No further rendering needed. */}
        </div>
      </div>
    
  );
}
