import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { waitlistService } from "~/services/grpc/authServices";
import authService from "~/services/grpc/auth.service";

export const meta = () => [
  { title: "Elder Care Waitlist — Homebit" },
  {
    name: "description",
    content:
      "Join Homebit's elder care waitlist as a household or househelp and get early access.",
  },
];

const SERVICE_OPTIONS = [
  "Elderly Care",
  "Special Needs People Care",
  "Overnight Care",
  "Househelp",
  "Indoor Cleaning",
  "Home Deep Cleaning",
  "Laundry & Ironing",
  "Meal Preps",
  "Pet Care",
  "Baby Sitter",
  "Early Childhood Care",
  "Post Party Cleaning",
  "Plumbing",
];

const COUNTRY_CODES = [
  { name: "Kenya", dialCode: "+254", iso: "KE" },
  { name: "Uganda", dialCode: "+256", iso: "UG" },
  { name: "Tanzania", dialCode: "+255", iso: "TZ" },
  { name: "Rwanda", dialCode: "+250", iso: "RW" },
  { name: "Burundi", dialCode: "+257", iso: "BI" },
  { name: "South Sudan", dialCode: "+211", iso: "SS" },
  { name: "Ethiopia", dialCode: "+251", iso: "ET" },
  { name: "Nigeria", dialCode: "+234", iso: "NG" },
  { name: "South Africa", dialCode: "+27", iso: "ZA" },
  { name: "United Kingdom", dialCode: "+44", iso: "GB" },
  { name: "United States", dialCode: "+1", iso: "US" },
  { name: "Canada", dialCode: "+1", iso: "CA" },
  { name: "India", dialCode: "+91", iso: "IN" },
  { name: "United Arab Emirates", dialCode: "+971", iso: "AE" },
];

type ProfileType = "household" | "househelp";

interface ElderCareFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_dial_code: string;
  phone_number: string;
  whatsapp_opt_in: boolean;
  message: string;
  services: string[];
}

const emptyForm: ElderCareFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone_dial_code: "+254",
  phone_number: "",
  whatsapp_opt_in: false,
  message: "",
  services: ["Elderly Care"],
};

const PROFILE_COPY: Record<ProfileType, { heading: string; paragraph: string; servicePrompt: string }> = {
  household: {
    heading: "Looking for help for your elders?",
    paragraph:
      "Join the elder-care waitlist to get early access to Homebit's trusted caregivers and household support professionals. We know how hard it is to find someone you can invite into a parent or grandparent's home with complete peace of mind. Homebit is building a safer, faster way for families to find dependable care for seniors at home by combining real human vetting with smart matching. Every caregiver and househelp on our platform goes through identity checks, reference reviews, and skills screening, so you are not starting from scratch or guessing based on a few text messages. We focus on care that respects dignity, culture, and routines, whether you need daily companionship, overnight support, or help with household tasks that keep your loved one comfortable. You will be able to describe your elder's needs, the kind of personality that works best for your home, preferred schedules, and any medical or mobility considerations. As the waitlist moves forward, we will share updates, service availability, and onboarding timelines so you can plan with confidence. Homebit is not just a list of names; it is a care experience built around trust, safety, and reliability. If you want a single place to find elder care, househelp, and additional support services without the stress of endless searching, this is the right place to start.",
    servicePrompt: "Would you need additional services?",
  },
  househelp: {
    heading: "You offer elder care?",
    paragraph:
      "Join the elder-care waitlist to be among the first care professionals households discover on Homebit. We are creating a trusted marketplace where caregivers and househelps can present their skills with confidence and be matched to families who value quality care. If you have experience with elder support, companionship, medication reminders, mobility assistance, or household routines that keep seniors safe and comfortable, Homebit will help you highlight that expertise. Our onboarding focuses on verification, references, and service details so families can trust you from the first interaction, and so you do not have to keep proving yourself repeatedly for every inquiry. You will be able to list the services you offer, your preferred schedules, and the kind of care environments you work best in. As we open access, we will prioritize waitlisted professionals, share new family requests early, and provide guidance on how to stand out with clear profiles and professional communication. Homebit is more than a job board; it is a long-term platform for caregivers who want stable opportunities, fair treatment, and a respectful relationship with the families they serve. If you are ready to build consistent elder-care work with families who appreciate reliability and heart, the waitlist is the first step.",
    servicePrompt: "What other services can you offer?",
  },
};

function normalizeFullPhone(dialCode: string, phoneNumber: string): string {
  const digits = phoneNumber.replace(/\s+/g, "").replace(/^0+/, "");
  return `${dialCode}${digits}`;
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
      className={`px-4 py-2 rounded-xl text-xs font-medium border-2 transition-all duration-200 ${
        selected
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md"
          : "border-purple-200 dark:border-purple-700 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
      }`}
    >
      {label}
    </button>
  );
}

function DialCodePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (dialCode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dialCode.includes(q),
    );
  }, [query]);

  const selected = COUNTRY_CODES.find((c) => c.dialCode === value) ?? COUNTRY_CODES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-full min-w-40 rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-xs flex items-center justify-between"
      >
        <span>{selected.name} ({selected.dialCode})</span>
        <ChevronDownIcon className="w-4 h-4 text-purple-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#13131a] shadow-xl p-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country or code"
            className="w-full rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#0f0f16] text-gray-900 dark:text-white px-2.5 py-2 text-xs mb-2 focus:outline-none focus:border-purple-500"
          />
          <div className="max-h-52 overflow-y-auto space-y-1">
            {filtered.map((country) => (
              <button
                key={`${country.iso}-${country.dialCode}`}
                type="button"
                onClick={() => {
                  onChange(country.dialCode);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                {country.name} ({country.dialCode})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ElderCareWaitlistPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const profile: ProfileType = searchParams.get("profile") === "househelp" ? "househelp" : "household";
  const copy = PROFILE_COPY[profile];

  const [form, setForm] = useState<ElderCareFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pendingPayload, setPendingPayload] = useState<Record<string, any> | null>(null);

  function toggleService(service: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  }

  function switchProfile(next: ProfileType) {
    setSearchParams({ profile: next });
  }

  async function createWaitlistEntry(payload: Record<string, any>) {
    await waitlistService.createWaitlist("", payload);
    setSuccess(true);
    setError(null);
    setShowOtpModal(false);
    setOtp("");
    setPendingPayload(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.first_name.trim()) {
      setError("First name is required.");
      return;
    }
    if (!form.phone_number.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (form.services.length === 0) {
      setError("Please select at least one service.");
      return;
    }

    const fullPhone = normalizeFullPhone(form.phone_dial_code, form.phone_number);
    const payload = {
      user_type: profile === "household" ? "family" : "worker",
      profile_type: profile,
      elder_care_waitlist: true,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: fullPhone,
      email: form.email.trim(),
      whatsapp_opt_in: form.whatsapp_opt_in,
      message: form.message.trim(),
      help_types: profile === "household" ? form.services : [],
      roles_sought: profile === "househelp" ? form.services : [],
    };

    setSubmitting(true);
    try {
      if (form.phone_dial_code === "+254") {
        await authService.sendOTP("", "phone", fullPhone);
        setPendingPayload(payload);
        setShowOtpModal(true);
      } else {
        await createWaitlistEntry(payload);
      }
    } catch (err: any) {
      const msg =
        err?.message || err?.toString() || "Something went wrong. Please try again.";
      setError(String(msg).replace(/^\d+\s*/, ""));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp() {
    if (!pendingPayload) return;
    if (!otp.trim()) {
      setOtpError("Please enter the OTP code.");
      return;
    }

    setOtpSubmitting(true);
    setOtpError(null);
    try {
      await authService.verifyOTP("", "phone", otp.trim());
      await createWaitlistEntry(pendingPayload);
    } catch (err: any) {
      const msg =
        err?.message || err?.toString() || "OTP verification failed. Please try again.";
      setOtpError(String(msg).replace(/^\d+\s*/, ""));
    } finally {
      setOtpSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (!pendingPayload?.phone) return;
    setOtpError(null);
    try {
      await authService.sendOTP("", "phone", pendingPayload.phone);
    } catch (err: any) {
      const msg = err?.message || err?.toString() || "Failed to resend OTP.";
      setOtpError(String(msg).replace(/^\d+\s*/, ""));
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-100 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f]">
      <Navigation />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
        {success ? (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">You're on the elder-care waitlist.</h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Thank you. We will notify you as soon as elder-care onboarding opens.
              </p>
            </div>
            <Link to="/" className="inline-block text-xs text-purple-600 dark:text-purple-400 hover:underline">
              Return to homepage
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 px-4 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                Elder Care Waitlist
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {copy.heading}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{copy.paragraph}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => switchProfile("household")}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  profile === "household"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent"
                    : "border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
              >
                Household
              </button>
              <button
                type="button"
                onClick={() => switchProfile("househelp")}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  profile === "househelp"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent"
                    : "border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
              >
                Househelp
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{copy.servicePrompt}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select all that apply.</p>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((service) => (
                  <ToggleChip
                    key={service}
                    label={service}
                    selected={form.services.includes(service)}
                    onClick={() => toggleService(service)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#13131a] border border-purple-100 dark:border-purple-900/30 p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">First name *</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))}
                    className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-xs"
                    placeholder="Your first name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last name</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))}
                    className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-xs"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone number *</label>
                <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2">
                  <DialCodePicker
                    value={form.phone_dial_code}
                    onChange={(dialCode) => setForm((prev) => ({ ...prev, phone_dial_code: dialCode }))}
                  />
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))}
                    className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-xs"
                    placeholder="712345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-xs"
                  placeholder="you@example.com"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.whatsapp_opt_in}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatsapp_opt_in: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 accent-purple-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Send me WhatsApp updates when elder-care onboarding opens.
                </span>
              </label>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Additional details</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-xs resize-none"
                  placeholder={
                    profile === "household"
                      ? "Tell us about the care support you are planning for your elder loved one..."
                      : "Tell us about your elder-care background and availability..."
                  }
                />
              </div>
            </div>

            {error && <ErrorAlert message={error} />}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Join Elder Care Waitlist"}
            </button>
          </form>
        )}
      </main>

      <Footer />

      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#13131a] border border-purple-100 dark:border-purple-900/30 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verify your phone number</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              We sent an OTP to {pendingPayload?.phone}. Enter it below to complete your waitlist request.
            </p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-white dark:bg-[#0f0f16] text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:border-purple-500 text-sm"
              placeholder="Enter OTP"
            />

            {otpError && <ErrorAlert message={otpError} />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResendOtp}
                className="flex-1 py-2.5 rounded-xl border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-40"
              >
                {otpSubmitting ? "Verifying..." : "Verify & Submit"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (otpSubmitting) return;
                setShowOtpModal(false);
              }}
              className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
