import React from "react";

interface FamilyContactsSectionProps {
  profile: any;
  onEdit: () => void;
}

export default function FamilyContactsSection({ profile, onEdit }: FamilyContactsSectionProps) {
  return (
    <section id="family-contacts" className="mb-6 scroll-mt-24">
      <div className="flex justify-end mb-2">
        <button className="btn-primary" onClick={onEdit}>Edit</button>
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
