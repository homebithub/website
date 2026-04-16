import React, { useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { waitlistService } from "~/services/grpc/authServices";
import { CheckCircleIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";

export const meta = () => [
  { title: "Join the Waitlist — Homebit" },
  { name: "description", content: "Join the Homebit waitlist for early access to vetted nannies, househelps, cleaners, and caregivers in Kenya." },
];

const HELP_TYPES = [
  "Indoor Cleaning",
  "Home Deep Cleaning",
  "Laundry & Ironing",
  "Overnight Care",
  "Elderly Care",
  "Special Needs People Care",
  "Pet Care",
  "Plumbing",
  "Househelp",
  "Early Childhood Care",
  "Post Party Cleaning",
  "Baby Sitter",
  "Postpartum Doula",
];

const WORKER_ROLES = [
  "Full-Time Househelp",
  "Home Deep Cleaning",
  "Laundry & Ironing",
  "Overnight Care for New Mothers",
  "Elderly Care",
  "Special Needs People Care",
  "Pet Care",
  "Plumbing",
  "Househelp",
  "Early Childhood Care",
  "Post Party Cleaning",
  "Meal Preps",
  "Baby Sitter",
  "NewBorn Care",
  "New Parents Support",
];

const CONCERNS = [
  "Trust", "Speed", "Experience", "Affordability", "Education",
  "Driver's License", "Professionally Trained",
];

const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi",
  "Kitale", "Garissa", "Kakamega", "Kisii", "Nyeri", "Machakos", "Meru",
  "Kericho", "Embu", "Migori", "Homabay", "Kilifi", "Kwale", "Other",
];

function normalizePhone(phone: string): string {
  const p = phone.trim();
  if (p.startsWith("+254")) return p;
  if (p.startsWith("254")) return `+254${p.slice(3)}`;
  if (p.startsWith("0")) return `+254${p.slice(1)}`;
  return p;
}

type UserType = "family" | "worker" | "partner" | null;
type StepId = "hero" | "who" | "family" | "worker" | "contact" | "success";

interface FormData {
  user_type: string;
  help_types: string[];
  location_county: string;
  location_area: string;
  urgency: string;
  employment_type: string;
  concerns: string[];
  roles_sought: string[];
  availability_locations: string[];
  work_preference: string;
  years_experience: string;
  skills: string;
  has_references: boolean | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  whatsapp_opt_in: boolean;
  message: string;
}

const emptyForm: FormData = {
  user_type: "",
  help_types: [],
  location_county: "",
  location_area: "",
  urgency: "",
  employment_type: "",
  concerns: [],
  roles_sought: [],
  availability_locations: [],
  work_preference: "",
  years_experience: "",
  skills: "",
  has_references: null,
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  whatsapp_opt_in: false,
  message: "",
};

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-1.5 mb-6">
      <div
        className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  );
}

function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
        selected
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md"
          : "border-purple-200 dark:border-purple-700 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
      }`}
    >
      {label}
    </button>
  );
}

function RadioCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 px-5 py-4 transition-all duration-200 ${
        selected
          ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md"
          : "border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            selected
              ? "border-purple-600 bg-purple-600"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default function WaitlistPage() {
  const [step, setStep] = useState<StepId>("hero");
  const [userType, setUserType] = useState<UserType>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [locationInput, setLocationInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: StepId[] =
    userType === "partner"
      ? ["hero", "who", "contact", "success"]
      : userType === "family"
      ? ["hero", "who", "family", "contact", "success"]
      : ["hero", "who", "worker", "contact", "success"];

  const currentStepIndex = steps.indexOf(step);
  const totalSteps = steps.length - 1;

  function toggleArray(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  function addLocation() {
    const loc = locationInput.trim();
    if (!loc || form.availability_locations.includes(loc)) return;
    if (form.availability_locations.length >= 10) return;
    setForm((f) => ({
      ...f,
      availability_locations: [...f.availability_locations, loc],
    }));
    setLocationInput("");
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...form,
        phone: normalizePhone(form.phone),
        user_type:
          userType === "family"
            ? "family"
            : userType === "worker"
            ? "worker"
            : "partner",
        has_references: form.has_references === true,
      };
      await waitlistService.createWaitlist("", payload);
      setStep("success");
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.toString() ||
        "Something went wrong. Please try again.";
      setError(msg.replace(/^\d+ /, ""));
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) setStep(steps[nextIndex]);
  }

  function goBack() {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setStep(steps[prevIndex]);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-100 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f]">
      <Navigation />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
        {/* Hero Step */}
        {step === "hero" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 px-4 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300">
                ✨ Homebit — Early Access
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Find trusted home help in Kenya without the usual guesswork.
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Join the waitlist for early access to vetted nannies, househelps, cleaners, and caregivers.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {["Vetted profiles", "Safer hiring", "Faster matching"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-1.5 text-sm text-purple-700 dark:text-purple-300 font-medium"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => { setUserType("family"); goNext(); }}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                Join the Waitlist
              </button>
              <button
                type="button"
                onClick={() => { setUserType("worker"); goNext(); }}
                className="flex-1 py-4 rounded-2xl border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 font-semibold text-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500 transition-all duration-200"
              >
                I'm looking for work
              </button>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#13131a] border border-purple-100 dark:border-purple-900/30 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Why early members join
              </p>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">Trust angle:</span>{" "}
                  Safer way to find home help.
                </p>
                <p>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">Speed angle:</span>{" "}
                  Get matched faster when we launch.
                </p>
                <p>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">Scarcity angle:</span>{" "}
                  Early access for first members in your area.
                </p>
                <p>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">Worker angle:</span>{" "}
                  Be among the first workers families see when hiring begins.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Who Are You Step */}
        {step === "who" && (
          <div className="space-y-6">
            <ProgressBar current={currentStepIndex} total={totalSteps} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Step {currentStepIndex} of {totalSteps}</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Who are you?</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                This helps us send you the most relevant updates.
              </p>
            </div>
            <div className="space-y-3">
              <RadioCard
                label="I need home help"
                description="Looking for a nanny, househelp, cleaner, caregiver, or similar"
                selected={userType === "family"}
                onClick={() => setUserType("family")}
              />
              <RadioCard
                label="I'm looking for a job"
                description="A nanny, househelp, cleaner, caregiver, or similar role"
                selected={userType === "worker"}
                onClick={() => setUserType("worker")}
              />
              <RadioCard
                label="I run an agency / want to partner"
                description="Bureau owner, recruiter, or service partner"
                selected={userType === "partner"}
                onClick={() => setUserType("partner")}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={goBack} className="flex items-center gap-1 px-5 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                <ChevronLeftIcon className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!userType}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Family Step */}
        {step === "family" && (
          <div className="space-y-6">
            <ProgressBar current={currentStepIndex} total={totalSteps} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Step {currentStepIndex} of {totalSteps}</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What kind of help do you need?</h2>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type of help (select all that apply)</p>
              <div className="flex flex-wrap gap-2">
                {HELP_TYPES.map((h) => (
                  <ToggleChip
                    key={h}
                    label={h}
                    selected={form.help_types.includes(h)}
                    onClick={() => setForm((f) => ({ ...f, help_types: toggleArray(f.help_types, h) }))}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">County</label>
                <select
                  value={form.location_county}
                  onChange={(e) => setForm((f) => ({ ...f, location_county: e.target.value }))}
                  className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm"
                >
                  <option value="">Select county</option>
                  {KENYAN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Area / Estate</label>
                <input
                  type="text"
                  value={form.location_area}
                  onChange={(e) => setForm((f) => ({ ...f, location_area: e.target.value }))}
                  placeholder="e.g. Westlands"
                  className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">When do you need help?</p>
              <div className="grid grid-cols-2 gap-2">
                {["Immediately", "This week", "This month", "Just researching"].map((u) => (
                  <RadioCard
                    key={u}
                    label={u}
                    selected={form.urgency === u}
                    onClick={() => setForm((f) => ({ ...f, urgency: u }))}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employment type</p>
              <div className="grid grid-cols-2 gap-2">
                {["Live-in", "Live-out", "Part-time", "Full-time"].map((e) => (
                  <RadioCard
                    key={e}
                    label={e}
                    selected={form.employment_type === e}
                    onClick={() => setForm((f) => ({ ...f, employment_type: e }))}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Biggest concern (select all that apply)</p>
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map((c) => (
                  <ToggleChip
                    key={c}
                    label={c}
                    selected={form.concerns.includes(c)}
                    onClick={() => setForm((f) => ({ ...f, concerns: toggleArray(f.concerns, c) }))}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={goBack} className="flex items-center gap-1 px-5 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                <ChevronLeftIcon className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={goNext} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 hover:shadow-lg transition-all">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Worker Step */}
        {step === "worker" && (
          <div className="space-y-6">
            <ProgressBar current={currentStepIndex} total={totalSteps} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Step {currentStepIndex} of {totalSteps}</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tell us about your work</h2>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role(s) you're seeking (select all that apply)</p>
              <div className="flex flex-wrap gap-2">
                {WORKER_ROLES.map((r) => (
                  <ToggleChip
                    key={r}
                    label={r}
                    selected={form.roles_sought.includes(r)}
                    onClick={() => setForm((f) => ({ ...f, roles_sought: toggleArray(f.roles_sought, r) }))}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Locations you can work in{" "}
                <span className="text-gray-400">(up to 10)</span>
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLocation(); } }}
                  placeholder="e.g. Westlands, Nairobi"
                  className="flex-1 rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addLocation}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Add
                </button>
              </div>
              {form.availability_locations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.availability_locations.map((loc) => (
                    <span key={loc} className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm">
                      {loc}
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, availability_locations: f.availability_locations.filter((l) => l !== loc) }))}
                        className="ml-1 text-purple-500 hover:text-purple-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work preference</p>
              <div className="grid grid-cols-2 gap-2">
                {["Live-in", "Live-out", "Part-time", "Full-time"].map((w) => (
                  <RadioCard
                    key={w}
                    label={w}
                    selected={form.work_preference === w}
                    onClick={() => setForm((f) => ({ ...f, work_preference: w }))}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Years of experience</label>
              <select
                value={form.years_experience}
                onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))}
                className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm"
              >
                <option value="">Select years</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1-2 years">1–2 years</option>
                <option value="3-5 years">3–5 years</option>
                <option value="More than 5 years">More than 5 years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skills and past education</label>
              <textarea
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                rows={3}
                placeholder="e.g. ECDE certificate, 3 years caring for infants, cooking..."
                className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm resize-none"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Do you have references?</p>
              <div className="grid grid-cols-2 gap-3">
                <RadioCard
                  label="Yes, I have references"
                  selected={form.has_references === true}
                  onClick={() => setForm((f) => ({ ...f, has_references: true }))}
                />
                <RadioCard
                  label="No references yet"
                  selected={form.has_references === false}
                  onClick={() => setForm((f) => ({ ...f, has_references: false }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={goBack} className="flex items-center gap-1 px-5 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                <ChevronLeftIcon className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={goNext} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 hover:shadow-lg transition-all">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Contact Step */}
        {step === "contact" && (
          <div className="space-y-6">
            <ProgressBar current={currentStepIndex} total={totalSteps} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Step {currentStepIndex} of {totalSteps}</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How do we reach you?</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Phone is required. Email is optional but recommended for updates.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First name *</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  placeholder="Your first name"
                  className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  placeholder="Your last name"
                  className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="0712 345 678"
                className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address <span className="text-gray-400">(optional but recommended)</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.whatsapp_opt_in}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp_opt_in: e.target.checked }))}
                className="mt-0.5 w-4 h-4 accent-purple-600"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Send me WhatsApp updates when Homebit opens in my area
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Any comments or specific requests? <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
                placeholder="Tell us anything else — your location, specific needs, questions, or feedback..."
                className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm resize-none"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={goBack} className="flex items-center gap-1 px-5 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                <ChevronLeftIcon className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!form.first_name || !form.phone || submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Joining..." : "Join Waitlist"}
              </button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">You're on the list.</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                We'll notify you as soon as Homebit opens access in your area.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#13131a] border border-purple-100 dark:border-purple-900/30 p-6 text-left shadow-sm space-y-3">
              <p className="font-semibold text-gray-900 dark:text-white">Know someone who needs this?</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share Homebit with friends and family — early members get priority onboarding when we launch.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && navigator.share) {
                    navigator.share({
                      title: "Homebit — Trusted Home Help in Kenya",
                      text: "Find vetted nannies, househelps, and caregivers in Kenya. Join the waitlist!",
                      url: window.location.origin + "/waitlist",
                    });
                  }
                }}
                className="w-full py-3 rounded-xl border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                Share Homebit
              </button>
            </div>

            <Link
              to="/"
              className="inline-block text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Return to homepage
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
