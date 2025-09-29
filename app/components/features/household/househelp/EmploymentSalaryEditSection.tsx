import React from "react";

interface EmploymentSalaryEditSectionProps {
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
  success: string | null;
}

const EmploymentSalaryEditSection: React.FC<EmploymentSalaryEditSectionProps> = ({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
  error,
  success,
}) => (
  <section id="employment-salary" className="mb-2 scroll-mt-24">
    <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Employment & Salary</h2>
    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={onSave}>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Employer ID</label>
        <input
          name="employer_id"
          value={form.employer_id || ""}
          onChange={onChange}
          className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Bureau ID</label>
        <input
          name="bureau_id"
          value={form.bureau_id || ""}
          onChange={onChange}
          className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Salary Expectation</label>
        <input
          name="salary_expectation"
          value={form.salary_expectation || ""}
          onChange={onChange}
          className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Salary Frequency</label>
        <input
          name="salary_frequency"
          value={form.salary_frequency || ""}
          onChange={onChange}
          className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Availability (comma separated)</label>
        <input
          name="availability"
          value={form.availability || ""}
          onChange={onChange}
          className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Signature</label>
        <input
          name="signature"
          value={form.signature || ""}
          onChange={onChange}
          className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Signed Date</label>
        <input
          name="signed_date"
          value={form.signed_date || ""}
          onChange={onChange}
          className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2 flex gap-2 mt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
      {error && <div className="col-span-2 text-red-600 mt-2">{error}</div>}
      {success && <div className="col-span-2 text-green-600 mt-2">{success}</div>}
    </form>
  </section>
);

export default EmploymentSalaryEditSection;
