import React, { useState, useEffect } from "react";

const initialFields = {
  status: "active",
  skill: "",
  speciality: "",
  experience: "",
  reference: "",
  salary_expectation_min: "",
  salary_expectation_max: "",
  salary_frequency: "monthly",
  availability_before: "",
  location: "",
  min_rating: "",
  sort: "popular",
  limit: 10,
};

export default function HouseholdEmployment() {
  const [fields, setFields] = useState(initialFields);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      setHasSearched(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/v1/househelps/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries({
              ...fields,
              experience: fields.experience ? Number(fields.experience) : undefined,
              salary_expectation_min: fields.salary_expectation_min ? Number(fields.salary_expectation_min) : undefined,
              salary_expectation_max: fields.salary_expectation_max ? Number(fields.salary_expectation_max) : undefined,
              min_rating: fields.min_rating ? Number(fields.min_rating) : undefined,
              limit: fields.limit ? Number(fields.limit) : 10,
            }).filter(([_, v]) => v !== undefined && v !== null && v !== "")
          )
        ),
      });
      if (!res.ok) throw new Error("Failed to fetch househelps");
      const data = await res.json();
      setResults(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-primary mb-4 text-center dark:text-primary-300">Find a Househelp</h1>
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-4 mb-8 w-full">
  <div className="flex flex-col">
    <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
    <select id="status" name="status" value={fields.status} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>
  <div className="flex flex-col">
    <label htmlFor="skill" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Skill</label>
    <input id="skill" name="skill" value={fields.skill} onChange={handleChange} placeholder="e.g. cooking" className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
  </div>
  <div className="flex flex-col">
    <label htmlFor="speciality" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Speciality</label>
    <input id="speciality" name="speciality" value={fields.speciality} onChange={handleChange} placeholder="e.g. elderly care" className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
  </div>
  <div className="flex flex-col">
    <label htmlFor="experience" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Experience (years)</label>
    <input id="experience" name="experience" type="number" min="0" value={fields.experience} onChange={handleChange} placeholder="Years" className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
  </div>
   
  <div className="flex flex-col">
    <label htmlFor="salary_frequency" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Salary Frequency</label>
    <select id="salary_frequency" name="salary_frequency" value={fields.salary_frequency} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
      <option value="monthly">Monthly</option>
      <option value="weekly">Weekly</option>
      <option value="daily">Daily</option>
    </select>
  </div>
  <div className="flex flex-col">
    <label htmlFor="availability_before" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Available From</label>
    <input id="availability_before" name="availability_before" type="date" value={fields.availability_before} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
  </div>
  <div className="flex flex-col">
    <label htmlFor="location" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
    <input id="location" name="location" value={fields.location} onChange={handleChange} placeholder="Location" className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition" />
  </div>

  <div className="flex flex-col col-span-1 md:col-span-3 lg:col-span-4 justify-end">
    <label className="sr-only">Search</label>
    <button type="submit" className="bg-primary text-white py-2 rounded-lg font-semibold shadow-md bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition mt-auto">Search</button>
  </div>
</form>
      {loading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">{error}</div>}
      <div className="space-y-4">
        {!hasSearched && !loading && <div className="text-center text-gray-500">Customize your search to find househelps.</div>}
        {hasSearched && results.length === 0 && !loading && <div className="text-center text-gray-500">No househelps found.</div>}
        {results.map((h) => (
          <div key={h.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 rounded-lg p-4 shadow">
            <img src={h.avatar_url || "https://placehold.co/56x56?text=HH"} alt={h.first_name} className="w-14 h-14 rounded-full object-cover bg-gray-200" />
            <div className="flex-1">
              <div className="font-bold text-lg text-primary-700 dark:text-primary-200">{h.first_name} {h.last_name}</div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Salary: {h.salary_expectation || 'N/A'} {h.salary_frequency}</div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Location: {h.county_of_residence || 'N/A'}</div>
              <div className="text-gray-400 text-xs">Joined: {h.created_at ? new Date(h.created_at).toLocaleDateString() : ''}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
       
