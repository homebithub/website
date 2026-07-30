import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";
import { clientProfileService, jobService } from "~/services/grpc/authServices";
import { getStoredUserProfileId } from "~/utils/authStorage";
import { useModalDismiss } from "~/hooks/useModalDismiss";
import {
  FIELD_LABEL_CLASS,
  INPUT_CLASS,
  RequiredLegend,
  RequiredMark,
  TEXTAREA_CLASS,
} from "~/components/ui/formStyles";
import CustomSelect from "~/components/ui/CustomSelect";

type JobPostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  job?: Record<string, any> | null;
  onSaved?: () => void | Promise<void>;
};

type JobType = {
  id?: number | string;
  name?: string;
  title?: string;
  description?: string;
};

type FeatureProperty = {
  id?: number | string;
  name?: string;
  title?: string;
  description?: string;
  value?: string;
  raw_value?: string;
  rawValue?: string;
};

type FeatureBundle = {
  feature_id?: number | string;
  featureId?: number | string;
  feature?: {
    id?: number | string;
    name?: string;
    title?: string;
    has_options?: boolean;
    hasOptions?: boolean;
  };
  name?: string;
  title?: string;
  properties?: FeatureProperty[];
  feature_properties?: FeatureProperty[];
  options?: FeatureProperty[];
  is_required?: boolean;
  default_weight?: number;
};

function asArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.job_types)) return record.job_types;
    if (Array.isArray(record.features)) return record.features;
  }
  return [];
}

function numericId(value: unknown): number {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function jobTypeId(jobType: JobType): number {
  return numericId(jobType.id);
}

function featureId(bundle: FeatureBundle): number {
  return numericId(bundle.feature_id || bundle.featureId || bundle.feature?.id);
}

function featureName(bundle: FeatureBundle): string {
  return String(bundle.feature?.name || bundle.feature?.title || bundle.name || bundle.title || "Feature");
}

function featureProperties(bundle: FeatureBundle): FeatureProperty[] {
  return asArray(bundle.properties || bundle.feature_properties || bundle.options);
}

function propertyId(property: FeatureProperty): number {
  return numericId(property.id);
}

function propertyName(property: FeatureProperty): string {
  return String(property.name || property.title || property.description || "Option");
}

function propertyValue(property: FeatureProperty): string {
  return String(property.value || property.raw_value || property.rawValue || propertyName(property));
}

function featureHasOptions(bundle: FeatureBundle): boolean {
  const explicit = bundle.feature?.has_options ?? bundle.feature?.hasOptions;
  if (typeof explicit === "boolean") return explicit;
  return featureProperties(bundle).length > 0;
}

function freeFormKey(featureID: number, propertyID: number): string {
  return `${featureID}:${propertyID || 0}`;
}

export default function JobPostModal({ isOpen, onClose, job, onSaved }: JobPostModalProps) {
  const editing = Boolean(job?.id);
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [selectedJobTypeId, setSelectedJobTypeId] = useState("");
  const [featureBundles, setFeatureBundles] = useState<FeatureBundle[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Record<number, number[]>>({});
  const [freeFormValues, setFreeFormValues] = useState<Record<string, string>>({});
  const [loadingJobTypes, setLoadingJobTypes] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { panelRef, onOverlayClick } = useModalDismiss(isOpen, onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(String(job?.title || ""));
    setDescription(String(job?.description || ""));
    setSelectedJobTypeId(String(job?.job_type_id || job?.jobTypeId || ""));
    setSelectedProperties({});
    setFreeFormValues({});
    setError("");
    setSuccess("");
  }, [isOpen, job]);

  useEffect(() => {
    if (!isOpen || editing) return;

    let cancelled = false;
    setLoadingJobTypes(true);

    clientProfileService.listJobTypes(true)
      .then((payload) => {
        if (!cancelled) setJobTypes(asArray(payload.data ?? payload));
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Unable to load job types");
      })
      .finally(() => {
        if (!cancelled) setLoadingJobTypes(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, editing]);

  useEffect(() => {
    if (!isOpen || editing || !selectedJobTypeId) {
      setFeatureBundles([]);
      return;
    }

    let cancelled = false;
    setLoadingFeatures(true);
    setError("");

    clientProfileService.getJobTypeFeatureBundles(selectedJobTypeId)
      .then((payload) => {
        if (!cancelled) {
          setFeatureBundles(asArray(payload.data ?? payload));
          setSelectedProperties({});
          setFreeFormValues({});
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Unable to load job type features");
      })
      .finally(() => {
        if (!cancelled) setLoadingFeatures(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, editing, selectedJobTypeId]);

  const selectedFeatureCount = useMemo(() => {
    const optionFeatures = Object.values(selectedProperties).filter((ids) => ids.length > 0).length;
    const textFeatures = featureBundles.filter((bundle) => {
      if (featureHasOptions(bundle)) return false;
      const fId = featureId(bundle);
      const properties = featureProperties(bundle);
      if (properties.length === 0) {
        return Boolean(freeFormValues[freeFormKey(fId, 0)]?.trim());
      }
      return properties.some((property) => freeFormValues[freeFormKey(fId, propertyId(property))]?.trim());
    }).length;
    return optionFeatures + textFeatures;
  }, [featureBundles, freeFormValues, selectedProperties]);

  if (!isOpen || !mounted) return null;

  const toggleProperty = (bundle: FeatureBundle, property: FeatureProperty) => {
    const fId = featureId(bundle);
    const pId = propertyId(property);
    if (!fId || !pId) return;

    setSelectedProperties((current) => {
      const ids = current[fId] || [];
      const nextIds = ids.includes(pId) ? ids.filter((id) => id !== pId) : [...ids, pId];
      return { ...current, [fId]: nextIds };
    });
  };

  const buildFeaturePayload = () => {
    return featureBundles.flatMap((bundle) => {
      const fId = featureId(bundle);
      if (!fId) return [];

      if (featureHasOptions(bundle)) {
        const propertyIds = selectedProperties[fId] || [];
        if (propertyIds.length === 0) return [];
        const propertiesById = new Map(featureProperties(bundle).map((property) => [propertyId(property), property]));

        return propertyIds.flatMap((pId) => {
          const property = propertiesById.get(pId);
          if (!property) return [];

          return [{
            feature_id: fId,
            property_ids: [pId],
            value: propertyValue(property),
            weight: Number(bundle.default_weight || 1),
          }];
        });
      }

      const properties = featureProperties(bundle);
      const prompts = properties.length > 0 ? properties : [{ id: 0, name: featureName(bundle) }];

      return prompts.flatMap((property) => {
        const pId = propertyId(property);
        const value = String(freeFormValues[freeFormKey(fId, pId)] || "").trim();
        if (!value) return [];

        return [{
          feature_id: fId,
          property_ids: pId ? [pId] : [],
          value,
          weight: Number(bundle.default_weight || 1),
        }];
      });
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setError("Title and description are required.");
      return;
    }

    if (!editing && !selectedJobTypeId) {
      setError("Select a job type.");
      return;
    }

    const userProfileId = getStoredUserProfileId();
    if (!editing && !userProfileId) {
      setError("User profile information is missing. Please sign in again.");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await jobService.updateJob(String(job?.id), "", {
          title: trimmedTitle,
          description: trimmedDescription,
        });
      } else {
        await jobService.createListing("", {
          user_profile_id: userProfileId,
          title: trimmedTitle,
          description: trimmedDescription,
          job_type_id: Number(selectedJobTypeId),
          features: buildFeaturePayload(),
        });
      }

      setSuccess(editing ? "Listing updated." : "Listing created.");
      await onSaved?.();
      window.setTimeout(onClose, 450);
    } catch (err: any) {
      setError(err?.message || "Unable to save listing");
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 isolate flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm dark:bg-black/70"
      style={{ zIndex: 2147483647 }}
      onClick={onOverlayClick}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={editing ? "Edit job posting" : "Create job posting"}
        className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-purple-200 bg-white shadow-2xl dark:border-purple-500/40 dark:bg-dark-card dark:shadow-[0_0_42px_rgba(168,85,247,0.35)]"
      >
        <div className="flex items-start justify-between border-b border-purple-100 px-6 py-5 dark:border-purple-500/25">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editing ? "Edit Job Posting" : "Create Job Posting"}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {editing ? "Update the listing details." : "Add the role, then choose the details clients need to know."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-purple-200 p-2 text-gray-500 transition hover:bg-purple-50 hover:text-gray-900 dark:border-purple-500/30 dark:text-gray-300 dark:hover:bg-purple-500/15 dark:hover:text-white"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(92vh-92px)] overflow-y-auto px-6 py-6">
          {error && <ErrorAlert title="Job Posting" message={error} durationMs={12000} />}
          {success && <SuccessAlert title="Job Posting" message={success} durationMs={3000} />}

          <RequiredLegend className="mb-4" />

          <div className="grid gap-5">
            <label className="block">
              <span className={FIELD_LABEL_CLASS}>
                Title
                <RequiredMark />
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                aria-required="true"
                className={INPUT_CLASS}
                placeholder="House Nanny"
              />
            </label>

            <label className="block">
              <span className={FIELD_LABEL_CLASS}>
                Description
                <RequiredMark />
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                required
                aria-required="true"
                className={TEXTAREA_CLASS}
                placeholder="Describe what the role involves."
              />
            </label>

            {!editing && (
              <label className="block">
                <span className={FIELD_LABEL_CLASS}>
                  Job Type
                  <RequiredMark />
                </span>
                <CustomSelect
                  value={selectedJobTypeId}
                  onChange={setSelectedJobTypeId}
                  disabled={loadingJobTypes}
                  required
                  ariaLabel="Job type"
                  placeholder={loadingJobTypes ? "Loading job types..." : "Select job type"}
                  options={jobTypes.map((type) => {
                    const id = jobTypeId(type);
                    return {
                      value: String(id),
                      label: String(type.name || type.title || `Job type ${id}`),
                    };
                  })}
                />
              </label>
            )}

            {!editing && selectedJobTypeId && (
              <section className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 dark:border-purple-500/25 dark:bg-purple-950/15">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Listing Details</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {loadingFeatures ? "Loading options..." : `${selectedFeatureCount} feature${selectedFeatureCount === 1 ? "" : "s"} filled`}
                    </p>
                  </div>
                </div>

                {!loadingFeatures && featureBundles.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No additional details are required for this job type.</p>
                )}

                <div className="space-y-5">
                  {featureBundles.map((bundle) => {
                    const fId = featureId(bundle);
                    const properties = featureProperties(bundle);
                    const hasOptions = featureHasOptions(bundle);
                    const required = Boolean(
                      (bundle as { is_required?: boolean; isRequired?: boolean }).is_required ??
                        (bundle as { isRequired?: boolean }).isRequired
                    );

                    return (
                      <div key={fId || featureName(bundle)} className="border-t border-purple-100 pt-4 first:border-t-0 first:pt-0 dark:border-purple-500/20">
                        <h4 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
                          {featureName(bundle)}
                          {required && <RequiredMark />}
                        </h4>

                        {hasOptions ? (
                          <div className="flex flex-wrap gap-2">
                            {properties.map((property) => {
                              const pId = propertyId(property);
                              const selected = Boolean(fId && pId && selectedProperties[fId]?.includes(pId));
                              return (
                                <button
                                  key={pId || propertyName(property)}
                                  type="button"
                                  onClick={() => toggleProperty(bundle, property)}
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                                    selected
                                      ? "border-purple-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                                      : "border-purple-200 bg-white text-gray-700 hover:border-purple-400 dark:border-slate-600 dark:bg-slate-950/45 dark:text-gray-200 dark:hover:border-purple-400"
                                  }`}
                                >
                                  <span
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                      selected
                                        ? "bg-purple-700/70 text-white"
                                        : "bg-purple-100 text-purple-700 dark:bg-purple-700/70 dark:text-white"
                                    }`}
                                  >
                                    {selected ? "✓" : propertyName(property).slice(0, 1).toUpperCase()}
                                  </span>
                                  {propertyName(property)}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {(properties.length > 0 ? properties : [{ id: 0, name: featureName(bundle) }]).map((property) => {
                              const pId = propertyId(property);
                              const key = freeFormKey(fId, pId);
                              const label = propertyName(property);

                              return (
                                <label key={key} className="block rounded-2xl border border-purple-100 bg-white/70 p-3 dark:border-purple-500/20 dark:bg-black/20">
                                  <span className={FIELD_LABEL_CLASS}>
                                    {label}
                                    {required && <RequiredMark />}
                                  </span>
                                  <input
                                    value={freeFormValues[key] || ""}
                                    onChange={(event) => setFreeFormValues((current) => ({ ...current, [key]: event.target.value }))}
                                    className={INPUT_CLASS}
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                  />
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-purple-300 px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/15"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loadingJobTypes || loadingFeatures}
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-bold text-white shadow-lg shadow-purple-500/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
