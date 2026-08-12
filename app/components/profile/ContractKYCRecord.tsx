import { useEffect, useState } from "react";
import { FileCheck2, IdCard, ShieldCheck } from "lucide-react";
import { getEmployerKYCRecord, type EmployerKYCRecord } from "~/services/employerKYC";

const display = (value?: string | null) => value?.trim() || "Not recorded";
const titleCase = (value?: string | null) =>
  display(value).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function ContractKYCRecord({
  househelpUserId,
  enabled,
  onViewDocument,
}: {
  househelpUserId: string;
  enabled: boolean;
  onViewDocument: (url: string) => void;
}) {
  const [record, setRecord] = useState<EmployerKYCRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !househelpUserId) return;
    let active = true;
    setLoading(true);
    setError("");
    void getEmployerKYCRecord(househelpUserId)
      .then((next) => active && setRecord(next))
      .catch((requestError) => active && setError(requestError instanceof Error ? requestError.message : "We couldn't load the identity record."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [enabled, househelpUserId]);

  // A 404 means either there is no mutually signed contract or no submitted
  // record. In both cases the private section should not advertise what exists.
  if (!enabled || loading || (!error && !record)) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-purple-200/60 bg-white dark:border-purple-500/30 dark:bg-[#13131a]">
      <div className="flex items-start gap-3 border-b border-purple-100 p-4 dark:border-purple-500/20 sm:p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-200">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Identity record</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
            Available because both parties signed an employment contract. Keep these private identity details secure.
          </p>
        </div>
      </div>

      {error ? (
        <p className="p-5 text-xs text-rose-600 dark:text-rose-300">{error}</p>
      ) : record ? (
        <div className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Verification status" value={titleCase(record.status)} />
            <Detail label="Name on document" value={display(record.verified_full_name || [record.verified_first_name, record.verified_last_name].filter(Boolean).join(" "))} />
            <Detail label="Document type" value={titleCase(record.id_type)} />
            <Detail label="Document number" value={display(record.id_number)} />
            <Detail label="Nationality" value={display(record.nationality)} />
            <Detail label="Date of birth" value={record.date_of_birth ? new Date(record.date_of_birth).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }) : "Not recorded"} />
            <Detail label="Gender" value={titleCase(record.gender)} />
          </div>

          {record.documents?.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Submitted documents</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {record.documents.map((document, index) => (
                  <button
                    key={`${document.type}-${index}`}
                    type="button"
                    disabled={!document.url}
                    onClick={() => document.url && onViewDocument(document.url)}
                    className="flex min-h-20 items-center gap-3 rounded-xl border border-purple-200 bg-purple-50/60 p-4 text-left transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-purple-500/25 dark:bg-purple-500/[0.06] dark:hover:bg-purple-500/10"
                  >
                    {document.type.toLowerCase().includes("selfie") ? <FileCheck2 className="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-300" /> : <IdCard className="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-300" />}
                    <span>
                      <span className="block text-xs font-semibold text-gray-900 dark:text-white">{document.type}</span>
                      <span className="mt-1 block text-[11px] text-gray-500 dark:text-gray-400">{document.url ? "View document" : "Preview unavailable"}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.035]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 break-words text-xs font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
