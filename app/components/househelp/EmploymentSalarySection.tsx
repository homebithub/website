import React from "react";

interface EmploymentSalarySectionProps {
  profile: any;
  onEdit: () => void;
}

export default function EmploymentSalarySection({ profile, onEdit }: EmploymentSalarySectionProps) {
  return (
    <section id="employment-salary" className="mb-6 scroll-mt-24">
      <div className="flex justify-end mb-2">
        <button className="btn-primary" onClick={onEdit}>Edit</button>
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
          <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.salary_expectation || '-'}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Salary Frequency</span>
          <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.salary_frequency || '-'}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Availability</span>
          <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Array.isArray(profile.availability) ? profile.availability.join(', ') : (profile.availability || '-')}</span>
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
