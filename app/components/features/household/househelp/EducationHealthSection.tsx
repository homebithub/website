import React from "react";

interface EducationHealthSectionProps {
  profile: any;
  onEdit: () => void;
}

export default function EducationHealthSection({ profile, onEdit }: EducationHealthSectionProps) {
  return (
    <section id="education-health" className="mb-6 sm:mb-8 scroll-mt-24">
      <div className="flex justify-end mb-2">
        <button className="btn-primary" onClick={onEdit}>Edit</button>
      </div>
      <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Education & Health</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8">
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
