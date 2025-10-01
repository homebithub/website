import React from "react";

interface PersonalDetailsSectionProps {
  profile: any;
  onEdit: () => void;
}

export default function PersonalDetailsSection({ profile, onEdit }: PersonalDetailsSectionProps) {
  return (
    <section id="personal-details" className="mb-6 sm:mb-8 scroll-mt-24">
      <div className="flex justify-end mb-2">
        <button className="btn-primary" onClick={onEdit}>Edit</button>
      </div>
      <h2 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-200">Personal Details</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8">
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
