import React, { useState } from "react";
import ExpandedImageModal from "./ExpandedImageModal";

interface ProfileOverviewSectionProps {
  profile: any;
  onEdit: () => void;
  onShowImageModal: () => void;
  userImages: any[];
  carouselIdx: number;
  setCarouselIdx: (idx: number) => void;
  showImageModal: boolean;
  imageFiles: File[];
  setImageFiles: (files: File[]) => void;
}

export default function ProfileOverviewSection({
  profile,
  onEdit,
  onShowImageModal,
  userImages,
  carouselIdx,
  setCarouselIdx,
  showImageModal,
  imageFiles,
  setImageFiles
}: ProfileOverviewSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(0);
  if (!profile) {
    return <div className="text-red-600">Profile data is missing or loading.</div>;
  }
  return (
    <section id="profile-overview" className="mb-6 scroll-mt-24">
      {userImages.length > 0 && (
        <div className="mb-6 w-full flex flex-col items-center">
          <div className="relative w-full max-w-xs h-56 flex items-center justify-center">
            <img
              src={"http://localhost:8080/images/" + userImages[carouselIdx].path.replace(/^src\//, '/')}
              alt={`User image ${carouselIdx + 1}`}
              className="object-contain w-full h-full rounded-xl shadow border dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer"
              onClick={() => {
                setExpandedIdx(carouselIdx);
                setExpanded(true);
              }}
            />
            {userImages.length > 1 && (
              <>
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 rounded-full p-2 shadow hover:bg-primary-100 dark:hover:bg-primary-800"
                  onClick={() => setCarouselIdx((carouselIdx - 1 + userImages.length) % userImages.length)}
                  aria-label="Previous image"
                >&lt;</button>
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 rounded-full p-2 shadow hover:bg-primary-100 dark:hover:bg-primary-800"
                  onClick={() => setCarouselIdx((carouselIdx + 1) % userImages.length)}
                  aria-label="Next image"
                >&gt;</button>
              </>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {userImages.map((_, i) => (
                <span
                  key={i}
                  className={`inline-block w-2 h-2 rounded-full ${i === carouselIdx ? 'bg-primary-500' : 'bg-gray-300 dark:bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ImageUploadModal should be imported and used here */}
      {/* <ImageUploadModal ... /> */}
      <div className="flex justify-end mb-2 gap-2">
        <button className="btn-primary" onClick={onEdit}>Edit</button>
        <button className="btn-secondary" onClick={onShowImageModal}>Upload Images</button>
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
      {/* Expanded Image Modal */}
      {expanded && (
        <ExpandedImageModal
          images={userImages}
          currentIdx={expandedIdx}
          onClose={() => setExpanded(false)}
          onPrev={() => setExpandedIdx((expandedIdx - 1 + userImages.length) % userImages.length)}
          onNext={() => setExpandedIdx((expandedIdx + 1) % userImages.length)}
        />
      )}
    </section>
  );
}
