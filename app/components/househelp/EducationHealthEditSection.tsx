import React from "react";

interface EducationHealthEditSectionProps {
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
  success: string | null;
}

const EducationHealthEditSection: React.FC<EducationHealthEditSectionProps> = ({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
  error,
  success,
}) => (
  <section id="education-health" className="mb-6 scroll-mt-24">
    <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Education & Health</h2>
    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={onSave}>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Education Level</label>
        <input name="education_level" value={form.education_level || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">School Name</label>
        <input name="school_name" value={form.school_name || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Diseases</label>
        <input name="diseases" value={form.diseases || ''} onChange={onChange} className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
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

export default EducationHealthEditSection;
