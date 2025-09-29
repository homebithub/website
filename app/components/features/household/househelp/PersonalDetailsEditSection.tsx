import React from "react";

interface PersonalDetailsEditSectionProps {
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
  success: string | null;
}

const PersonalDetailsEditSection: React.FC<PersonalDetailsEditSectionProps> = ({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
  error,
  success,
}) => (
  <section id="personal-details" className="mb-6 scroll-mt-24">
    <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Personal Details</h2>
    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={onSave}>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">National ID</label>
        <input name="national_id_no" value={form.national_id_no || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Telephone (Alt)</label>
        <input name="telephone_alt" value={form.telephone_alt || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Current Location</label>
        <input name="current_location" value={form.current_location || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Home Area</label>
        <input name="home_area" value={form.home_area || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nearest Shopping Center</label>
        <input name="nearest_shopping_center" value={form.nearest_shopping_center || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Person Known</label>
        <input name="person_known" value={form.person_known || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Person Known Tel</label>
        <input name="person_known_tel" value={form.person_known_tel || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nearest School</label>
        <input name="nearest_school" value={form.nearest_school || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Nearest Church</label>
        <input name="nearest_church" value={form.nearest_church || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">County of Residence</label>
        <input name="county_of_residence" value={form.county_of_residence || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Sub County</label>
        <input name="sub_county" value={form.sub_county || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Location</label>
        <input name="location" value={form.location || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Village</label>
        <input name="village" value={form.village || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Marital Status</label>
        <input name="marital_status" value={form.marital_status || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">No. of Children & Age</label>
        <input name="no_of_children_and_age" value={form.no_of_children_and_age || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div className="sm:col-span-2 flex gap-2 mt-4">
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
      {error && <div className="col-span-2 text-red-600 mt-2">{error}</div>}
      {success && <div className="col-span-2 text-green-600 mt-2">{success}</div>}
    </form>
  </section>
);

export default PersonalDetailsEditSection;
