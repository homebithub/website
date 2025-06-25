import React, { useEffect, useState } from "react";
import { Navigation } from "~/components/Navigation";

const househelpSections = [
  { label: "Profile Overview", id: "profile-overview" },
  { label: "Personal Details", id: "personal-details" },
  { label: "Family & Contacts", id: "family-contacts" },
  { label: "Education & Health", id: "education-health" },
  { label: "Employment & Salary", id: "employment-salary" },
];

export default function HousehelpDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(househelpSections[0].id);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Handle edit state
  const handleEdit = (sectionId: string) => {
    setEditSection(sectionId);
    setForm({ ...profile });
    setSuccess(null);
    setError(null);
  };
  const handleCancel = () => {
    setEditSection(null);
    setForm({});
    setSuccess(null);
    setError(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleSave = async (sectionId: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      let updateFields: any = {};
      if (sectionId === "profile-overview") {
        updateFields = {
          bio: form.bio,
          experience: form.experience,
          hourly_rate: form.hourly_rate,
          skills: form.skills,
          languages: form.languages,
          specialities: form.specialities,
          references: form.references,
        };
      } else if (sectionId === "personal-details") {
        updateFields = {
          "national_id_no;not null": form["national_id_no;not null"],
          telephone_alt: form.telephone_alt,
          current_location: form.current_location,
          home_area: form.home_area,
          nearest_shopping_center: form.nearest_shopping_center,
          person_known: form.person_known,
          person_known_tel: form.person_known_tel,
          nearest_school: form.nearest_school,
          nearest_church: form.nearest_church,
          county_of_residence: form.county_of_residence,
          sub_county: form.sub_county,
          location: form.location,
          village: form.village,
          marital_status: form.marital_status,
          no_of_children_and_age: form.no_of_children_and_age,
        };
      } else if (sectionId === "family-contacts") {
        updateFields = {
          fathers_name: form.fathers_name,
          fathers_tel: form.fathers_tel,
          mothers_name: form.mothers_name,
          mothers_tel: form.mothers_tel,
          next_of_kin: form.next_of_kin,
          next_of_kin_tel: form.next_of_kin_tel,
          home_contact: form.home_contact,
          home_contact_tel: form.home_contact_tel,
        };
      } else if (sectionId === "education-health") {
        updateFields = {
          education_level: form.education_level,
          school_name: form.school_name,
          diseases: form.diseases,
        };
      } else if (sectionId === "employment-salary") {
        updateFields = {
          employer_id: form.employer_id,
          bureau_id: form.bureau_id,
          salary_expectation: form.salary_expectation,
          salary_frequency: form.salary_frequency,
          availability: form.availability,
          signature: form.signature,
          signed_date: form.signed_date,
        };
      }
      const res = await fetch("http://localhost:8080/api/v1/profile/househelp/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateFields),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setProfile(updated);
      setEditSection(null);
      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (error) return <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-6 text-center">{error}</div>;
  if (!profile) return null;

  // Section renderers
  const renderSection = (id: string) => {
    if (id === "profile-overview") {
      if (editSection === id) {
        return (
          <section id="profile-overview" className="mb-6 scroll-mt-24">
            <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Profile Overview</h2>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleSave(id); }}>
              {/* Only editable fields shown here for brevity */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Bio</label>
                <textarea name="bio" value={form.bio || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Experience (yrs)</label>
                <input name="experience" type="number" value={form.experience || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Hourly Rate</label>
                <input name="hourly_rate" type="number" value={form.hourly_rate || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Skills (comma separated)</label>
                <input name="skills" value={form.skills || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Languages (comma separated)</label>
                <input name="languages" value={form.languages || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Specialities (comma separated)</label>
                <input name="specialities" value={form.specialities || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">References (comma separated)</label>
                <input name="references" value={form.references || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2 flex gap-2 mt-4">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>Cancel</button>
              </div>
              {error && <div className="col-span-2 text-red-600 mt-2">{error}</div>}
              {success && <div className="col-span-2 text-green-600 mt-2">{success}</div>}
            </form>
          </section>
        );
      }
      // View mode
      return (
        <section id="profile-overview" className="mb-6 scroll-mt-24">
          <div className="flex justify-end mb-2">
            <button className="btn-primary" onClick={() => handleEdit(id)}>Edit</button>
          </div>
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
      );
    }
    if (id === "personal-details") {
      if (editSection === id) {
        return (
          <section id="personal-details" className="mb-6 scroll-mt-24">
            <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Personal Details</h2>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleSave(id); }}>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">National ID</label>
                <input name="national_id_no;not null" value={form["national_id_no;not null"] || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Telephone (Alt)</label>
                <input name="telephone_alt" value={form.telephone_alt || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Current Location</label>
                <input name="current_location" value={form.current_location || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Home Area</label>
                <input name="home_area" value={form.home_area || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nearest Shopping Center</label>
                <input name="nearest_shopping_center" value={form.nearest_shopping_center || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Person Known</label>
                <input name="person_known" value={form.person_known || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Person Known Tel</label>
                <input name="person_known_tel" value={form.person_known_tel || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nearest School</label>
                <input name="nearest_school" value={form.nearest_school || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nearest Church</label>
                <input name="nearest_church" value={form.nearest_church || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">County of Residence</label>
                <input name="county_of_residence" value={form.county_of_residence || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Sub County</label>
                <input name="sub_county" value={form.sub_county || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Location</label>
                <input name="location" value={form.location || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Village</label>
                <input name="village" value={form.village || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Marital Status</label>
                <input name="marital_status" value={form.marital_status || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">No. of Children & Age</label>
                <input name="no_of_children_and_age" value={form.no_of_children_and_age || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2 flex gap-2 mt-4">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>Cancel</button>
              </div>
              {error && <div className="col-span-2 text-red-600 mt-2">{error}</div>}
              {success && <div className="col-span-2 text-green-600 mt-2">{success}</div>}
            </form>
          </section>
        );
      }
      return (
        <section id="personal-details" className="mb-6 scroll-mt-24">
          <div className="flex justify-end mb-2">
            <button className="btn-primary" onClick={() => handleEdit(id)}>Edit</button>
          </div>
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
      );
    }
    if (id === "family-contacts") {
      if (editSection === id) {
        return (
          <section id="family-contacts" className="mb-6 scroll-mt-24">
            <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Family & Contacts</h2>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleSave(id); }}>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Father's Name</label>
                <input name="fathers_name" value={form.fathers_name || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Father's Tel</label>
                <input name="fathers_tel" value={form.fathers_tel || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Mother's Name</label>
                <input name="mothers_name" value={form.mothers_name || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Mother's Tel</label>
                <input name="mothers_tel" value={form.mothers_tel || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Next of Kin</label>
                <input name="next_of_kin" value={form.next_of_kin || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Next of Kin Tel</label>
                <input name="next_of_kin_tel" value={form.next_of_kin_tel || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Home Contact</label>
                <input name="home_contact" value={form.home_contact || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Home Contact Tel</label>
                <input name="home_contact_tel" value={form.home_contact_tel || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2 flex gap-2 mt-4">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>Cancel</button>
              </div>
              {error && <div className="col-span-2 text-red-600 mt-2">{error}</div>}
              {success && <div className="col-span-2 text-green-600 mt-2">{success}</div>}
            </form>
          </section>
        );
      }
      return (
        <section id="family-contacts" className="mb-6 scroll-mt-24">
          <div className="flex justify-end mb-2">
            <button className="btn-primary" onClick={() => handleEdit(id)}>Edit</button>
          </div>
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
      );
    }
    if (id === "education-health") {
      if (editSection === id) {
        return (
          <section id="education-health" className="mb-6 scroll-mt-24">
            <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Education & Health</h2>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleSave(id); }}>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Education Level</label>
                <input name="education_level" value={form.education_level || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">School Name</label>
                <input name="school_name" value={form.school_name || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Diseases</label>
                <input name="diseases" value={form.diseases || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2 flex gap-2 mt-4">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>Cancel</button>
              </div>
              {error && <div className="col-span-2 text-red-600 mt-2">{error}</div>}
              {success && <div className="col-span-2 text-green-600 mt-2">{success}</div>}
            </form>
          </section>
        );
      }
      return (
        <section id="education-health" className="mb-6 scroll-mt-24">
          <div className="flex justify-end mb-2">
            <button className="btn-primary" onClick={() => handleEdit(id)}>Edit</button>
          </div>
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
      );
    }
    if (id === "employment-salary") {
      if (editSection === id) {
        return (
          <section id="employment-salary" className="mb-2 scroll-mt-24">
            <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Employment & Salary</h2>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleSave(id); }}>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Employer ID</label>
                <input name="employer_id" value={form.employer_id || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Bureau ID</label>
                <input name="bureau_id" value={form.bureau_id || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Salary Expectation</label>
                <input name="salary_expectation" value={form.salary_expectation || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Salary Frequency</label>
                <input name="salary_frequency" value={form.salary_frequency || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Availability (comma separated)</label>
                <input name="availability" value={form.availability || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Signature</label>
                <input name="signature" value={form.signature || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Signed Date</label>
                <input name="signed_date" value={form.signed_date || ''} onChange={handleChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2 flex gap-2 mt-4">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>Cancel</button>
              </div>
              {error && <div className="col-span-2 text-red-600 mt-2">{error}</div>}
              {success && <div className="col-span-2 text-green-600 mt-2">{success}</div>}
            </form>
          </section>
        );
      }
      return (
        <section id="employment-salary" className="mb-2 scroll-mt-24">
          <div className="flex justify-end mb-2">
            <button className="btn-primary" onClick={() => handleEdit(id)}>Edit</button>
          </div>
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
      );
    }
    return null;
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen w-full bg-slate-950">
        <div className="mx-auto w-full max-w-6xl flex flex-col sm:flex-row gap-2 items-start overflow-x-hidden">
          {/* Sidebar */}
          <aside className="w-full sm:w-56 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 p-4 rounded-xl shadow-sm flex flex-col space-y-2 mb-4 sm:mb-0">
            {househelpSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`block text-left w-full px-4 py-2 rounded-lg text-base font-medium transition-colors duration-150
                  ${activeSection === section.id
                    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 font-bold"
                    : "text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-200"}
                `}
              >
                {section.label}
              </button>
            ))}
          </aside>
          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
              <h1 className="text-2xl font-bold text-primary mb-2 text-center dark:text-primary-300">Househelp Profile</h1>
              <div className="text-center text-gray-500 dark:text-gray-300 mb-6">Your househelp profile details</div>
              {renderSection(activeSection)}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
