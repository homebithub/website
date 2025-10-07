import React, {useEffect, useState} from "react";
import {Navigation} from "~/components/Navigation";
import ProfileOverviewSection from "../components/househelp/ProfileOverviewSection";
import EmploymentSalaryEditSection from "../components/househelp/EmploymentSalaryEditSection";
import PersonalDetailsSection from "../components/househelp/PersonalDetailsSection";
import PersonalDetailsEditSection from "../components/househelp/PersonalDetailsEditSection";
import FamilyContactsEditSection from "../components/househelp/FamilyContactsEditSection";
import EducationHealthEditSection from "../components/househelp/EducationHealthEditSection";
import FamilyContactsSection from "../components/househelp/FamilyContactsSection";
import EducationHealthSection from "../components/househelp/EducationHealthSection";
import EmploymentSalarySection from "../components/househelp/EmploymentSalarySection";
import Joi from 'joi';
import { API_ENDPOINTS } from '~/config/api';

const househelpSections = [
    {label: "Profile Overview", id: "profile-overview"},
    {label: "Personal Details", id: "personal-details"},
    {label: "Family & Contacts", id: "family-contacts"},
    {label: "Education & Health", id: "education-health"},
    {label: "Employment & Salary", id: "employment-salary"},
];


function isValidUuid(uuid: string | undefined | null): boolean {
    if (!uuid) return false;
    // Joi's uuid validation returns an error if invalid, otherwise returns the value
    const {error} = Joi.string().uuid().validate(uuid);
    return !error;
}

function ImageUploadModal({open, onClose, files, setFiles}: {
    open: boolean;
    onClose: () => void;
    files: File[];
    setFiles: (files: File[]) => void;
}) {
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (open && files.length > 0) {
            const readers = files.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(readers).then(setPreviews);
        } else {
            setPreviews([]);
        }
    }, [files, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files ? Array.from(e.target.files) : [];
        // Only allow up to 5 images total
        setFiles([...files, ...selected].slice(0, 5));
    };

    const handleRemove = (idx: number) => {
        setFiles(files.filter((_, i) => i !== idx));
    };

    const handleReplace = (idx: number, file: File) => {
        setFiles(files.map((f, i) => (i === idx ? file : f)));
    };

    return (
        <div
            className={`fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-lg ${open ? '' : 'hidden'}`}
            aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg relative">
                <h3 className="text-xl font-bold mb-4 text-purple-600">Upload Images</h3>
                <div className="flex flex-col gap-4">
                    <div className="text-sm text-gray-600 mb-1">
                        You can upload up to 5 images, 10MB each.
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={files.length >= 5}
                        className="block mb-2"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        {previews.map((src, idx) => (
                            <div key={idx} className="relative border rounded-lg overflow-hidden">
                                <img src={src} alt={`Preview ${idx + 1}`} className="object-cover w-full h-32"/>
                                <div className="absolute top-1 right-1 flex gap-1">
                                    <label
                                        className="cursor-pointer text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded hover:bg-primary-300">
                                        Replace
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{display: 'none'}}
                                            onChange={e => {
                                                if (e.target.files && e.target.files[0]) handleReplace(idx, e.target.files[0]);
                                            }}
                                        />
                                    </label>
                                    <button
                                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                                        onClick={() => handleRemove(idx)}
                                        type="button"
                                    >Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            className="btn-primary"
                            style={{background: '#a259e6'}}
                            disabled={!files.length || files.some(f => f.size > 10 * 1024 * 1024) || uploading}
                            onClick={async () => {
                                setErrorMsg(null);
                                if (files.length === 0) return;
                                if (files.some(f => f.size > 10 * 1024 * 1024)) {
                                    setErrorMsg('Each image must be 10MB or less.');
                                    return;
                                }
                                setUploading(true);
                                try {
                                    const formData = new FormData();
                                    files.forEach(f => formData.append('images', f));
                                    const token = localStorage.getItem('token');
                                    const res = await fetch(API_ENDPOINTS.images.upload, {
                                        method: 'POST',
                                        body: formData,
                                        headers: token ? {Authorization: `Bearer ${token}`} : undefined,
                                    });
                                    if (!res.ok) {
                                        const err = await res.json().catch(() => ({}));
                                        throw new Error(err.message || 'Failed to upload images');
                                    }
                                    // Optionally handle response data
                                    setFiles([]);
                                    setUploading(false);
                                    onClose();
                                } catch (err: any) {
                                    setUploading(false);
                                    setErrorMsg(err.message || 'Failed to upload images');
                                }
                            }}
                        >{uploading ? 'Uploading...' : 'Submit'}</button>
                    </div>
                    {errorMsg && (
                        <div className="text-red-600 mt-2 text-sm text-center">{errorMsg}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function HousehelpDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState(househelpSections[0].id);
    const [editSection, setEditSection] = useState<string | null>(null);
    const [form, setForm] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    // For image upload modal
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    // For user image carousel (fix hook order error)
    const [userImages, setUserImages] = useState<any[]>([]);
    const [carouselIdx, setCarouselIdx] = useState(0);
    useEffect(() => {
        // Only fetch once per mount of this section
        const fetchImages = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(API_ENDPOINTS.images.user, {
                    headers: token ? {Authorization: `Bearer ${token}`} : undefined,
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserImages(Array.isArray(data.images) ? data.images : []);
                    setCarouselIdx(0);
                }
            } catch {
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Not authenticated");
                const res = await fetch(API_ENDPOINTS.profile.househelp.me, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (!res.ok) throw new Error("Failed to fetch profile");
                const data = await res.json();
                setProfile(data);
            } catch (err: any) {
                setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Handle edit state
    const handleEdit = (sectionId: string) => {
        setEditSection(sectionId);
        setForm({...profile});
        setSuccess(null);
        setError(null);
    };
    const handleCancel = () => {
        setEditSection(null);
        setForm({});
        setSuccess(null);
        setError(null);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setForm((prev: any) => ({...prev, [name]: value}));
    };
    const handleSave = async (sectionId: string) => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not authenticated");
            let updateFields: any = {};
            if (sectionId === "profile-overview") {
                updateFields = {
                    bio: form.bio,
                    experience: form.experience,
                    hourly_rate: form.hourly_rate,
                    skills: form.skills,
                    languages: form.languages,
                    specialities: form.specialities,
                    references: form.references,
                };
            } else if (sectionId === "personal-details") {
                updateFields = {
                    "national_id_no;not null": form["national_id_no;not null"],
                    telephone_alt: form.telephone_alt,
                    current_location: form.current_location,
                    home_area: form.home_area,
                    nearest_shopping_center: form.nearest_shopping_center,
                    person_known: form.person_known,
                    person_known_tel: form.person_known_tel,
                    nearest_school: form.nearest_school,
                    nearest_church: form.nearest_church,
                    county_of_residence: form.county_of_residence,
                    sub_county: form.sub_county,
                    location: form.location,
                    village: form.village,
                    marital_status: form.marital_status,
                    no_of_children_and_age: form.no_of_children_and_age,
                };
            } else if (sectionId === "family-contacts") {
                updateFields = {
                    fathers_name: form.fathers_name,
                    fathers_tel: form.fathers_tel,
                    mothers_name: form.mothers_name,
                    mothers_tel: form.mothers_tel,
                    next_of_kin: form.next_of_kin,
                    next_of_kin_tel: form.next_of_kin_tel,
                    home_contact: form.home_contact,
                    home_contact_tel: form.home_contact_tel,
                };
            } else if (sectionId === "education-health") {
                updateFields = {
                    education_level: form.education_level,
                    school_name: form.school_name,
                    diseases: form.diseases,
                };
            } else if (sectionId === "employment-salary") {
                updateFields = {
                    employer_id: form.employer_id,
                    bureau_id: form.bureau_id,
                    salary_expectation: form.salary_expectation,
                    salary_frequency: form.salary_frequency,
                    availability: form.availability,
                    signature: form.signature,
                    signed_date: form.signed_date,
                };
            }
            const res = await fetch(API_ENDPOINTS.profile.househelp.me, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateFields),
            });
            if (!res.ok) throw new Error("Failed to update profile");
            const updated = await res.json();
            setProfile(updated);
            setEditSection(null);
            setSuccess("Profile updated successfully.");
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const [uploadingImages, setUploadingImages] = useState(false);
    const onUploadImages = async () => {
        setUploadingImages(true);
        try {
            if (imageFiles.length === 0) return;
            if (imageFiles.some(f => f.size > 10 * 1024 * 1024)) {
                alert('Each image must be 10MB or less.');
                setUploadingImages(false);
                return;
            }
            const formData = new FormData();
            imageFiles.forEach(f => formData.append('images', f));
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.images.upload, {
                method: 'POST',
                body: formData,
                headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to upload images');
            }
            setImageFiles([]);
            setShowImageModal(false);
            // Refresh images
            const imgRes = await fetch(API_ENDPOINTS.images.user, {
                headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            });
            if (imgRes.ok) {
                const data = await imgRes.json();
                setUserImages(Array.isArray(data.images) ? data.images : []);
                setCarouselIdx(0);
            }
        } catch (err: any) {
            alert(err.message || 'Failed to upload images');
        } finally {
            setUploadingImages(false);
        }
    };
    function renderSection(sectionId: string) {
        if (sectionId === "profile-overview") {
            return (
                <ProfileOverviewSection
                    profile={profile}
                    onEdit={() => handleEdit(sectionId)}
                    onShowImageModal={() => setShowImageModal(true)}
                    userImages={userImages}
                    carouselIdx={carouselIdx}
                    setCarouselIdx={setCarouselIdx}
                    showImageModal={showImageModal}
                    imageFiles={imageFiles}
                    setImageFiles={setImageFiles}
                    onCloseImageModal={()=>setShowImageModal(false)}
                    onUploadImages={onUploadImages}
                    uploadingImages={uploadingImages}
                />
            );
        }
        if (sectionId === "personal-details") {
            if (editSection === sectionId) {
                return (
                    <PersonalDetailsEditSection
                        form={form}
                        onChange={handleChange}
                        onSave={(e: React.FormEvent) => {
                            e.preventDefault();
                            handleSave(sectionId);
                        }}
                        onCancel={handleCancel}
                        saving={saving}
                        error={error}
                        success={success}
                    />
                );
            }
            return (
                <PersonalDetailsSection
                    profile={profile}
                    onEdit={() => handleEdit(sectionId)}
                />
            );
        }
        if (sectionId === "family-contacts") {
            if (editSection === sectionId) {
                return (
                    <FamilyContactsEditSection
                        form={form}
                        onChange={handleChange}
                        onSave={(e: React.FormEvent) => {
                            e.preventDefault();
                            handleSave(sectionId);
                        }}
                        onCancel={handleCancel}
                        saving={saving}
                        error={error}
                        success={success}
                    />
                );
            }
            return (
                <FamilyContactsSection
                    profile={profile}
                    onEdit={() => handleEdit(sectionId)}
                />
            );
        }
        if (sectionId === "education-health") {
            if (editSection === sectionId) {
                return (
                    <EducationHealthEditSection
                        form={form}
                        onChange={handleChange}
                        onSave={(e: React.FormEvent) => {
                            e.preventDefault();
                            handleSave(sectionId);
                        }}
                        onCancel={handleCancel}
                        saving={saving}
                        error={error}
                        success={success}
                    />
                );
            }
            return (
                <EducationHealthSection
                    profile={profile}
                    onEdit={() => handleEdit(sectionId)}
                />
            );
        }
        if (sectionId === "employment-salary") {
            if (editSection === sectionId) {
                return (
                    <EmploymentSalaryEditSection
                        form={form}
                        onChange={handleChange}
                        onSave={(e: React.FormEvent) => {
                            e.preventDefault();
                            handleSave(sectionId);
                        }}
                        onCancel={handleCancel}
                        saving={saving}
                        error={error}
                        success={success}
                    />
                );
            }
            return (
                <EmploymentSalarySection
                    profile={profile}
                    onEdit={() => handleEdit(sectionId)}
                />
            );
        }
        return null;
    }

    return (
        <>
            <Navigation/>
            <div className="min-h-screen w-full bg-gray-50 py-8">
                <div className="mx-auto w-full max-w-6xl flex flex-col sm:flex-row gap-2 items-start overflow-x-hidden">
                    {/* Sidebar */}
                    <aside
                        className="w-full sm:w-56 bg-white border-r border-gray-100 p-4 rounded-xl shadow-sm flex flex-col space-y-2 mb-4 sm:mb-0">
                        {househelpSections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`block text-left w-full px-4 py-2 rounded-lg text-base font-medium transition-colors duration-150
                                ${activeSection === section.id
                                    ? "bg-purple-100 text-purple-600 font-bold"
                                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"}
                                `}
                            >
                                {section.label}
                            </button>
                        ))}
                    </aside>
                    {/* Main Content */}
                    <section className="flex-1 min-w-0">
                        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            {renderSection(activeSection)}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
