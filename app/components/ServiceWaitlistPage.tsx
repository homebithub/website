import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { waitlistService } from "~/services/grpc/authServices";

const COUNTRY_CODES = [
  { name: "Afghanistan", dialCode: "+93", iso: "AF" },
  { name: "Albania", dialCode: "+355", iso: "AL" },
  { name: "Algeria", dialCode: "+213", iso: "DZ" },
  { name: "American Samoa", dialCode: "+1684", iso: "AS" },
  { name: "Andorra", dialCode: "+376", iso: "AD" },
  { name: "Angola", dialCode: "+244", iso: "AO" },
  { name: "Anguilla", dialCode: "+1264", iso: "AI" },
  { name: "Antigua and Barbuda", dialCode: "+1268", iso: "AG" },
  { name: "Argentina", dialCode: "+54", iso: "AR" },
  { name: "Armenia", dialCode: "+374", iso: "AM" },
  { name: "Aruba", dialCode: "+297", iso: "AW" },
  { name: "Australia", dialCode: "+61", iso: "AU" },
  { name: "Austria", dialCode: "+43", iso: "AT" },
  { name: "Azerbaijan", dialCode: "+994", iso: "AZ" },
  { name: "Bahamas", dialCode: "+1242", iso: "BS" },
  { name: "Bahrain", dialCode: "+973", iso: "BH" },
  { name: "Bangladesh", dialCode: "+880", iso: "BD" },
  { name: "Barbados", dialCode: "+1246", iso: "BB" },
  { name: "Belarus", dialCode: "+375", iso: "BY" },
  { name: "Belgium", dialCode: "+32", iso: "BE" },
  { name: "Belize", dialCode: "+501", iso: "BZ" },
  { name: "Bermuda", dialCode: "+1441", iso: "BM" },
  { name: "Benin", dialCode: "+229", iso: "BJ" },
  { name: "Bhutan", dialCode: "+975", iso: "BT" },
  { name: "Bolivia", dialCode: "+591", iso: "BO" },
  { name: "Bosnia and Herzegovina", dialCode: "+387", iso: "BA" },
  { name: "Botswana", dialCode: "+267", iso: "BW" },
  { name: "Brazil", dialCode: "+55", iso: "BR" },
  { name: "British Virgin Islands", dialCode: "+1284", iso: "VG" },
  { name: "Brunei", dialCode: "+673", iso: "BN" },
  { name: "Bulgaria", dialCode: "+359", iso: "BG" },
  { name: "Burkina Faso", dialCode: "+226", iso: "BF" },
  { name: "Burundi", dialCode: "+257", iso: "BI" },
  { name: "Cabo Verde", dialCode: "+238", iso: "CV" },
  { name: "Cayman Islands", dialCode: "+1345", iso: "KY" },
  { name: "Cambodia", dialCode: "+855", iso: "KH" },
  { name: "Cameroon", dialCode: "+237", iso: "CM" },
  { name: "Canada", dialCode: "+1", iso: "CA" },
  { name: "Central African Republic", dialCode: "+236", iso: "CF" },
  { name: "Chad", dialCode: "+235", iso: "TD" },
  { name: "Chile", dialCode: "+56", iso: "CL" },
  { name: "China", dialCode: "+86", iso: "CN" },
  { name: "Christmas Island", dialCode: "+61", iso: "CX" },
  { name: "Cocos (Keeling) Islands", dialCode: "+61", iso: "CC" },
  { name: "Colombia", dialCode: "+57", iso: "CO" },
  { name: "Comoros", dialCode: "+269", iso: "KM" },
  { name: "Congo (DRC)", dialCode: "+243", iso: "CD" },
  { name: "Congo (Republic)", dialCode: "+242", iso: "CG" },
  { name: "Cook Islands", dialCode: "+682", iso: "CK" },
  { name: "Costa Rica", dialCode: "+506", iso: "CR" },
  { name: "Cote d'Ivoire", dialCode: "+225", iso: "CI" },
  { name: "Croatia", dialCode: "+385", iso: "HR" },
  { name: "Cuba", dialCode: "+53", iso: "CU" },
  { name: "Curacao", dialCode: "+599", iso: "CW" },
  { name: "Cyprus", dialCode: "+357", iso: "CY" },
  { name: "Czechia", dialCode: "+420", iso: "CZ" },
  { name: "Denmark", dialCode: "+45", iso: "DK" },
  { name: "Djibouti", dialCode: "+253", iso: "DJ" },
  { name: "Dominica", dialCode: "+1767", iso: "DM" },
  { name: "Dominican Republic", dialCode: "+1809", iso: "DO" },
  { name: "Ecuador", dialCode: "+593", iso: "EC" },
  { name: "Egypt", dialCode: "+20", iso: "EG" },
  { name: "El Salvador", dialCode: "+503", iso: "SV" },
  { name: "Equatorial Guinea", dialCode: "+240", iso: "GQ" },
  { name: "Eritrea", dialCode: "+291", iso: "ER" },
  { name: "Estonia", dialCode: "+372", iso: "EE" },
  { name: "Eswatini", dialCode: "+268", iso: "SZ" },
  { name: "Ethiopia", dialCode: "+251", iso: "ET" },
  { name: "Faroe Islands", dialCode: "+298", iso: "FO" },
  { name: "Fiji", dialCode: "+679", iso: "FJ" },
  { name: "Finland", dialCode: "+358", iso: "FI" },
  { name: "France", dialCode: "+33", iso: "FR" },
  { name: "French Guiana", dialCode: "+594", iso: "GF" },
  { name: "French Polynesia", dialCode: "+689", iso: "PF" },
  { name: "Gabon", dialCode: "+241", iso: "GA" },
  { name: "Gambia", dialCode: "+220", iso: "GM" },
  { name: "Georgia", dialCode: "+995", iso: "GE" },
  { name: "Germany", dialCode: "+49", iso: "DE" },
  { name: "Ghana", dialCode: "+233", iso: "GH" },
  { name: "Gibraltar", dialCode: "+350", iso: "GI" },
  { name: "Greece", dialCode: "+30", iso: "GR" },
  { name: "Greenland", dialCode: "+299", iso: "GL" },
  { name: "Grenada", dialCode: "+1473", iso: "GD" },
  { name: "Guadeloupe", dialCode: "+590", iso: "GP" },
  { name: "Guam", dialCode: "+1671", iso: "GU" },
  { name: "Guatemala", dialCode: "+502", iso: "GT" },
  { name: "Guernsey", dialCode: "+44", iso: "GG" },
  { name: "Guinea", dialCode: "+224", iso: "GN" },
  { name: "Guinea-Bissau", dialCode: "+245", iso: "GW" },
  { name: "Guyana", dialCode: "+592", iso: "GY" },
  { name: "Haiti", dialCode: "+509", iso: "HT" },
  { name: "Honduras", dialCode: "+504", iso: "HN" },
  { name: "Hong Kong", dialCode: "+852", iso: "HK" },
  { name: "Hungary", dialCode: "+36", iso: "HU" },
  { name: "Iceland", dialCode: "+354", iso: "IS" },
  { name: "India", dialCode: "+91", iso: "IN" },
  { name: "Indonesia", dialCode: "+62", iso: "ID" },
  { name: "Iran", dialCode: "+98", iso: "IR" },
  { name: "Iraq", dialCode: "+964", iso: "IQ" },
  { name: "Ireland", dialCode: "+353", iso: "IE" },
  { name: "Isle of Man", dialCode: "+44", iso: "IM" },
  { name: "Israel", dialCode: "+972", iso: "IL" },
  { name: "Italy", dialCode: "+39", iso: "IT" },
  { name: "Jamaica", dialCode: "+1876", iso: "JM" },
  { name: "Japan", dialCode: "+81", iso: "JP" },
  { name: "Jersey", dialCode: "+44", iso: "JE" },
  { name: "Jordan", dialCode: "+962", iso: "JO" },
  { name: "Kazakhstan", dialCode: "+7", iso: "KZ" },
  { name: "Kenya", dialCode: "+254", iso: "KE" },
  { name: "Kiribati", dialCode: "+686", iso: "KI" },
  { name: "Kosovo", dialCode: "+383", iso: "XK" },
  { name: "Kuwait", dialCode: "+965", iso: "KW" },
  { name: "Kyrgyzstan", dialCode: "+996", iso: "KG" },
  { name: "Laos", dialCode: "+856", iso: "LA" },
  { name: "Latvia", dialCode: "+371", iso: "LV" },
  { name: "Lebanon", dialCode: "+961", iso: "LB" },
  { name: "Lesotho", dialCode: "+266", iso: "LS" },
  { name: "Liberia", dialCode: "+231", iso: "LR" },
  { name: "Libya", dialCode: "+218", iso: "LY" },
  { name: "Liechtenstein", dialCode: "+423", iso: "LI" },
  { name: "Lithuania", dialCode: "+370", iso: "LT" },
  { name: "Luxembourg", dialCode: "+352", iso: "LU" },
  { name: "Macau", dialCode: "+853", iso: "MO" },
  { name: "Madagascar", dialCode: "+261", iso: "MG" },
  { name: "Malawi", dialCode: "+265", iso: "MW" },
  { name: "Malaysia", dialCode: "+60", iso: "MY" },
  { name: "Maldives", dialCode: "+960", iso: "MV" },
  { name: "Mali", dialCode: "+223", iso: "ML" },
  { name: "Malta", dialCode: "+356", iso: "MT" },
  { name: "Marshall Islands", dialCode: "+692", iso: "MH" },
  { name: "Martinique", dialCode: "+596", iso: "MQ" },
  { name: "Mauritania", dialCode: "+222", iso: "MR" },
  { name: "Mauritius", dialCode: "+230", iso: "MU" },
  { name: "Mayotte", dialCode: "+262", iso: "YT" },
  { name: "Mexico", dialCode: "+52", iso: "MX" },
  { name: "Micronesia", dialCode: "+691", iso: "FM" },
  { name: "Moldova", dialCode: "+373", iso: "MD" },
  { name: "Monaco", dialCode: "+377", iso: "MC" },
  { name: "Montserrat", dialCode: "+1664", iso: "MS" },
  { name: "Mongolia", dialCode: "+976", iso: "MN" },
  { name: "Montenegro", dialCode: "+382", iso: "ME" },
  { name: "Morocco", dialCode: "+212", iso: "MA" },
  { name: "Mozambique", dialCode: "+258", iso: "MZ" },
  { name: "Myanmar", dialCode: "+95", iso: "MM" },
  { name: "Namibia", dialCode: "+264", iso: "NA" },
  { name: "Nauru", dialCode: "+674", iso: "NR" },
  { name: "Nepal", dialCode: "+977", iso: "NP" },
  { name: "Netherlands", dialCode: "+31", iso: "NL" },
  { name: "New Caledonia", dialCode: "+687", iso: "NC" },
  { name: "New Zealand", dialCode: "+64", iso: "NZ" },
  { name: "Nicaragua", dialCode: "+505", iso: "NI" },
  { name: "Niger", dialCode: "+227", iso: "NE" },
  { name: "Nigeria", dialCode: "+234", iso: "NG" },
  { name: "Niue", dialCode: "+683", iso: "NU" },
  { name: "North Korea", dialCode: "+850", iso: "KP" },
  { name: "North Macedonia", dialCode: "+389", iso: "MK" },
  { name: "Northern Mariana Islands", dialCode: "+1670", iso: "MP" },
  { name: "Norway", dialCode: "+47", iso: "NO" },
  { name: "Oman", dialCode: "+968", iso: "OM" },
  { name: "Pakistan", dialCode: "+92", iso: "PK" },
  { name: "Palau", dialCode: "+680", iso: "PW" },
  { name: "Palestine", dialCode: "+970", iso: "PS" },
  { name: "Panama", dialCode: "+507", iso: "PA" },
  { name: "Papua New Guinea", dialCode: "+675", iso: "PG" },
  { name: "Paraguay", dialCode: "+595", iso: "PY" },
  { name: "Peru", dialCode: "+51", iso: "PE" },
  { name: "Philippines", dialCode: "+63", iso: "PH" },
  { name: "Poland", dialCode: "+48", iso: "PL" },
  { name: "Portugal", dialCode: "+351", iso: "PT" },
  { name: "Puerto Rico", dialCode: "+1787", iso: "PR" },
  { name: "Qatar", dialCode: "+974", iso: "QA" },
  { name: "Romania", dialCode: "+40", iso: "RO" },
  { name: "Reunion", dialCode: "+262", iso: "RE" },
  { name: "Russia", dialCode: "+7", iso: "RU" },
  { name: "Rwanda", dialCode: "+250", iso: "RW" },
  { name: "Saint Barthelemy", dialCode: "+590", iso: "BL" },
  { name: "Saint Helena", dialCode: "+290", iso: "SH" },
  { name: "Saint Kitts and Nevis", dialCode: "+1869", iso: "KN" },
  { name: "Saint Lucia", dialCode: "+1758", iso: "LC" },
  { name: "Saint Martin", dialCode: "+590", iso: "MF" },
  { name: "Saint Pierre and Miquelon", dialCode: "+508", iso: "PM" },
  { name: "Saint Vincent and the Grenadines", dialCode: "+1784", iso: "VC" },
  { name: "Samoa", dialCode: "+685", iso: "WS" },
  { name: "San Marino", dialCode: "+378", iso: "SM" },
  { name: "Sao Tome and Principe", dialCode: "+239", iso: "ST" },
  { name: "Saudi Arabia", dialCode: "+966", iso: "SA" },
  { name: "Senegal", dialCode: "+221", iso: "SN" },
  { name: "Serbia", dialCode: "+381", iso: "RS" },
  { name: "Seychelles", dialCode: "+248", iso: "SC" },
  { name: "Sierra Leone", dialCode: "+232", iso: "SL" },
  { name: "Singapore", dialCode: "+65", iso: "SG" },
  { name: "Sint Maarten", dialCode: "+1721", iso: "SX" },
  { name: "Slovakia", dialCode: "+421", iso: "SK" },
  { name: "Slovenia", dialCode: "+386", iso: "SI" },
  { name: "Solomon Islands", dialCode: "+677", iso: "SB" },
  { name: "Somalia", dialCode: "+252", iso: "SO" },
  { name: "South Africa", dialCode: "+27", iso: "ZA" },
  { name: "South Korea", dialCode: "+82", iso: "KR" },
  { name: "South Sudan", dialCode: "+211", iso: "SS" },
  { name: "Spain", dialCode: "+34", iso: "ES" },
  { name: "Sri Lanka", dialCode: "+94", iso: "LK" },
  { name: "Sudan", dialCode: "+249", iso: "SD" },
  { name: "Suriname", dialCode: "+597", iso: "SR" },
  { name: "Sweden", dialCode: "+46", iso: "SE" },
  { name: "Switzerland", dialCode: "+41", iso: "CH" },
  { name: "Syria", dialCode: "+963", iso: "SY" },
  { name: "Taiwan", dialCode: "+886", iso: "TW" },
  { name: "Tajikistan", dialCode: "+992", iso: "TJ" },
  { name: "Tanzania", dialCode: "+255", iso: "TZ" },
  { name: "Thailand", dialCode: "+66", iso: "TH" },
  { name: "Timor-Leste", dialCode: "+670", iso: "TL" },
  { name: "Togo", dialCode: "+228", iso: "TG" },
  { name: "Tokelau", dialCode: "+690", iso: "TK" },
  { name: "Tonga", dialCode: "+676", iso: "TO" },
  { name: "Trinidad and Tobago", dialCode: "+1868", iso: "TT" },
  { name: "Tunisia", dialCode: "+216", iso: "TN" },
  { name: "Turkey", dialCode: "+90", iso: "TR" },
  { name: "Turkmenistan", dialCode: "+993", iso: "TM" },
  { name: "Turks and Caicos Islands", dialCode: "+1649", iso: "TC" },
  { name: "Tuvalu", dialCode: "+688", iso: "TV" },
  { name: "Uganda", dialCode: "+256", iso: "UG" },
  { name: "Ukraine", dialCode: "+380", iso: "UA" },
  { name: "United Arab Emirates", dialCode: "+971", iso: "AE" },
  { name: "United Kingdom", dialCode: "+44", iso: "GB" },
  { name: "United States", dialCode: "+1", iso: "US" },
  { name: "US Virgin Islands", dialCode: "+1340", iso: "VI" },
  { name: "Uruguay", dialCode: "+598", iso: "UY" },
  { name: "Uzbekistan", dialCode: "+998", iso: "UZ" },
  { name: "Vanuatu", dialCode: "+678", iso: "VU" },
  { name: "Vatican City", dialCode: "+379", iso: "VA" },
  { name: "Venezuela", dialCode: "+58", iso: "VE" },
  { name: "Vietnam", dialCode: "+84", iso: "VN" },
  { name: "Wallis and Futuna", dialCode: "+681", iso: "WF" },
  { name: "Yemen", dialCode: "+967", iso: "YE" },
  { name: "Zambia", dialCode: "+260", iso: "ZM" },
  { name: "Zimbabwe", dialCode: "+263", iso: "ZW" },
];

const CONCERNS = [
  "Trust",
  "Speed",
  "Experience",
  "Affordability",
  "Education",
  "Driver's License",
  "Professionally Trained",
];

type ProfileType = "household" | "househelp";

interface ServiceWaitlistConfig {
  serviceSlug: string;
  serviceName: string;
  serviceOptions: string[];
  profileCopy: Record<ProfileType, { heading: string; paragraph: string; servicePrompt: string; concernPrompt: string }>;
  payloadKey: string;
  whatsappText: string;
  shareText: string;
}

interface ServiceWaitlistPageProps {
  config: ServiceWaitlistConfig;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_dial_code: string;
  phone_number: string;
  whatsapp_opt_in: boolean;
  message: string;
  services: string[];
  concerns: string[];
}

function normalizeFullPhone(dialCode: string, phoneNumber: string): string {
  const digits = phoneNumber.replace(/\s+/g, "").replace(/^0+/, "");
  return `${dialCode}${digits}`;
}

function getEmptyPayloadFields(payload: Record<string, any>): string[] {
  return Object.entries(payload)
    .filter(([, value]) => {
      if (typeof value === "string") return value.trim() === "";
      if (Array.isArray(value)) return value.length === 0;
      return value === null || value === undefined;
    })
    .map(([key]) => key);
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

export function ServiceWaitlistPage({ config }: ServiceWaitlistPageProps) {
  const [searchParams] = useSearchParams();
  const profile: ProfileType = searchParams.get("profile") === "househelp" ? "househelp" : "household";
  const copy = config.profileCopy[profile];

  const emptyForm: FormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone_dial_code: "+254",
    phone_number: "",
    whatsapp_opt_in: false,
    message: "",
    services: [config.serviceName],
    concerns: [],
  };

  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const defaultShareUrl = useMemo(
    () => `https://homebit.co.ke/waitlist/${config.serviceSlug}?profile=${profile}`,
    [config.serviceSlug, profile],
  );
  const activeShareUrl = shareUrl || defaultShareUrl;

  function toggleService(service: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  }

  function toggleConcern(concern: string) {
    setForm((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }));
  }

  async function createWaitlistEntry(payload: Record<string, any>) {
    const result = await waitlistService.createWaitlist("", payload);
    const returnedShareUrl =
      result?.referral_url || result?.referralUrl || result?.share_url || result?.shareUrl;

    setShareUrl(
      typeof returnedShareUrl === "string" && returnedShareUrl.trim()
        ? returnedShareUrl.trim()
        : defaultShareUrl,
    );
    setSuccess(true);
    setError(null);
    setShowShareModal(true);
    setShareCopied(false);
  }

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(activeShareUrl);
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Homebit's ${config.serviceName} waitlist`,
          text: config.shareText,
          url: activeShareUrl,
        });
        return;
      } catch {
        // Falling back to copy keeps the modal useful when native sharing is cancelled or blocked.
      }
    }

    await handleCopyShareLink();
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
    const payload: Record<string, any> = {
      user_type: profile === "household" ? "family" : "worker",
      profile_type: profile,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: fullPhone,
      email: form.email.trim(),
      whatsapp_opt_in: form.whatsapp_opt_in,
      message: form.message.trim(),
      concerns: form.concerns,
      help_types: profile === "household" ? form.services : [],
      roles_sought: profile === "househelp" ? form.services : [],
    };
    payload[config.payloadKey] = true;

    console.groupCollapsed(`[WAITLIST_DEBUG] ${config.serviceName} waitlist submit`);
    console.log("[WAITLIST_DEBUG] profile", profile);
    console.log("[WAITLIST_DEBUG] raw form", form);
    console.log("[WAITLIST_DEBUG] normalized phone", fullPhone);
    console.log("[WAITLIST_DEBUG] payload", payload);
    console.warn("[WAITLIST_DEBUG] empty payload fields", getEmptyPayloadFields(payload));
    console.groupEnd();

    setSubmitting(true);
    try {
      await createWaitlistEntry(payload);
    } catch (err: any) {
      console.error(`[WAITLIST_DEBUG] createWaitlist failed`, {
        error: err,
        message: err?.message,
        code: err?.code,
        metadata: err?.metadata,
        stack: err?.stack,
        payload,
      });
      const msg =
        err?.message || err?.toString() || "Something went wrong. Please try again.";
      setError(String(msg).replace(/^\d+\s*/, ""));
    } finally {
      setSubmitting(false);
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">You're on the {config.serviceName} waitlist.</h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Thank you. We will notify you as soon as {config.serviceName} onboarding opens.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Share Homebit
              </button>
              <Link to="/" className="inline-block text-sm text-purple-600 dark:text-purple-400 hover:underline">
                Return to homepage
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 px-4 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                {config.serviceName} Waitlist
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {copy.heading}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{copy.paragraph}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{copy.servicePrompt}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select all that apply.</p>
              <div className="flex flex-wrap gap-2">
                {config.serviceOptions.map((service) => (
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
                  {config.whatsappText}
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
                      ? `Tell us about the ${config.serviceName.toLowerCase()} support you are looking for...`
                      : `Tell us about your ${config.serviceName.toLowerCase()} background and availability...`
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{copy.concernPrompt} <span className="font-normal text-gray-500 dark:text-gray-400">(select all that apply)</span></p>
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map((concern) => (
                  <ToggleChip
                    key={concern}
                    label={concern}
                    selected={form.concerns.includes(concern)}
                    onClick={() => toggleConcern(concern)}
                  />
                ))}
              </div>
            </div>

            {error && <ErrorAlert message={error} />}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-40"
            >
              {submitting ? "Submitting..." : "Join Waitlist"}
            </button>
          </form>
        )}
      </main>

      <Footer />

      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#13131a] border border-purple-100 dark:border-purple-900/30 p-6 space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">You are on the list.</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help another family discover trusted {config.serviceName.toLowerCase()}. Share this waitlist link with someone who needs reliable support at home.
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/20 p-3">
              <p className="break-all text-xs text-purple-800 dark:text-purple-200">{activeShareUrl}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="flex-1 py-2.5 rounded-xl border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                {shareCopied ? "Copied" : "Copy Link"}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-40"
              >
                Share
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
