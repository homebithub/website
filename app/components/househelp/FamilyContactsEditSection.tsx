import React from "react";

interface FamilyContactsEditSectionProps {
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
  success: string | null;
}

const FamilyContactsEditSection: React.FC<FamilyContactsEditSectionProps> = ({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
  error,
  success,
}) => (
  <section id="family-contacts" className="mb-6 scroll-mt-24">
    <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Family & Contacts</h2>
    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={onSave}>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Father's Name</label>
        <input name="fathers_name" value={form.fathers_name || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Father's Tel</label>
        <input name="fathers_tel" value={form.fathers_tel || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Mother's Name</label>
        <input name="mothers_name" value={form.mothers_name || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Mother's Tel</label>
        <input name="mothers_tel" value={form.mothers_tel || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Next of Kin</label>
        <input name="next_of_kin" value={form.next_of_kin || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Next of Kin Tel</label>
        <input name="next_of_kin_tel" value={form.next_of_kin_tel || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Home Contact</label>
        <input name="home_contact" value={form.home_contact || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Home Contact Tel</label>
        <input name="home_contact_tel" value={form.home_contact_tel || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
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

export default FamilyContactsEditSection;
