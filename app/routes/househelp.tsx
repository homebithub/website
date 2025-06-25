import React from "react";

import { useEffect, useState } from "react";
import { Navigation } from "~/components/Navigation";

export default function HousehelpDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const res = await fetch("http://localhost:8080/api/v1/profile/househelp/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (error) return <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-6 text-center">{error}</div>;
  if (!profile) return null;

  return (
    <>
      <Navigation />
      <main className="flex flex-col items-center px-2 py-8 min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center dark:text-primary-300">Househelp Profile</h1>
        <div className="text-center text-gray-500 dark:text-gray-300 mb-6">Your househelp profile details</div>
        {/* Profile Overview */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Profile Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Status</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.profile_status}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Type</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.profile_type}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Verified</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.verified ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Created At</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.created_at ? new Date(profile.created_at).toLocaleString() : '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Updated At</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.updated_at ? new Date(profile.updated_at).toLocaleString() : '-'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Bio</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.bio || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Experience (yrs)</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.experience}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Hourly Rate</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.hourly_rate}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Skills</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Array.isArray(profile.skills) ? profile.skills.join(', ') : '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Languages</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Array.isArray(profile.languages) ? profile.languages.join(', ') : '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Specialities</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Array.isArray(profile.specialities) ? profile.specialities.join(', ') : '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">References</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Array.isArray(profile.references) ? profile.references.join(', ') : '-'}</span>
            </div>
          </div>
        </section>
        {/* Personal Details */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Personal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">National ID</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile["national_id_no;not null"] || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Telephone (Alt)</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.telephone_alt || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Current Location</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.current_location || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Home Area</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.home_area || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nearest Shopping Center</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.nearest_shopping_center || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Person Known</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.person_known || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Person Known Tel</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.person_known_tel || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nearest School</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.nearest_school || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nearest Church</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.nearest_church || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">County of Residence</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.county_of_residence || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Sub County</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.sub_county || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Location</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.location || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Village</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.village || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Marital Status</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.marital_status || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">No. of Children & Age</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.no_of_children_and_age || '-'}</span>
            </div>
          </div>
        </section>
        {/* Family & Contacts */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Family & Contacts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Father's Name</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.fathers_name || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Father's Tel</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.fathers_tel || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Mother's Name</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.mothers_name || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Mother's Tel</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.mothers_tel || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Next of Kin</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.next_of_kin || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Next of Kin Tel</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.next_of_kin_tel || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Home Contact</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.home_contact || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Home Contact Tel</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.home_contact_tel || '-'}</span>
            </div>
          </div>
        </section>
        {/* Education & Health */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Education & Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Education Level</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.education_level || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">School Name</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.school_name || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Diseases</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.diseases || '-'}</span>
            </div>
          </div>
        </section>
        {/* Employment & Salary */}
        <section className="mb-2">
          <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Employment & Salary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Employer ID</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.employer_id || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Bureau ID</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.bureau_id || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Salary Expectation</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.salary_expectation}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Salary Frequency</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.salary_frequency || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Availability</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Array.isArray(profile.availability) ? profile.availability.join(', ') : '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Signature</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.signature || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Signed Date</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.signed_date ? new Date(profile.signed_date).toLocaleString() : '-'}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
