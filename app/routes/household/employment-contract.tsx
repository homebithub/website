import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { notificationsService } from '~/services/grpc/notifications.service';
import { employmentContractService } from '~/services/grpc/authServices';
import { useAuth } from '~/contexts/useAuth';
import {
  FileText, CheckCircle, XCircle, Download, Mail, Send,
  ChevronLeft, Edit3, Check, AlertCircle, Plus, Trash2
} from 'lucide-react';
import { resolveHousehelpProfile, resolveHousehelpProfileId } from '~/utils/househelpProfiles';
import { FormPageSkeleton } from "~/components/ShimmerLoader";
import CustomSelect from '~/components/ui/CustomSelect';
import { contractPdfBytes, downloadContractPdf } from '~/utils/contractDocument';

interface ContractClause {
  id: string;
  title: string;
  body: string;
  included: boolean;
}

interface EmploymentContract {
  id: string;
  hire_contract_id?: string;
  household_id: string;
  househelp_id: string;
  household_user_id: string;
  househelp_user_id: string;
  status: string;
  job_title: string;
  job_description: string;
  salary: number;
  salary_frequency: string;
  start_date?: string;
  end_date?: string;
  work_location: string;
  clauses: ContractClause[];
  custom_clauses: string[];
  household_signature: string;
  household_signed_at?: string;
  household_signer_name: string;
  househelp_signature: string;
  househelp_signed_at?: string;
  househelp_signer_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
  household?: any;
  househelp?: any;
}

type ViewMode = 'configure' | 'preview' | 'view';

export default function EmploymentContractPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const contractId = searchParams.get('id');
  const househelpId = searchParams.get('househelp_id');
  const hireContractId = searchParams.get('hire_contract_id');
  const backTo = searchParams.get('backTo') || (contractId ? '/household/employment-contracts' : '/household/hiring');
  const backLabel = searchParams.get('backLabel') || (contractId ? 'Back to Contracts' : 'Back to Hiring');
  const printRef = useRef<HTMLDivElement>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [resolvedHousehelpProfileId, setResolvedHousehelpProfileId] = useState<string>(househelpId || '');
  // What the advert said about pay, when it named a band rather than a figure.
  // Shown beside the salary field instead of being guessed at: picking an end of
  // somebody's posted range and calling it their wage is not a default to make
  // quietly.
  const postedSalary = searchParams.get('posted_salary') || '';

  const [viewMode, setViewMode] = useState<ViewMode>(contractId ? 'view' : 'configure');
  const [contract, setContract] = useState<EmploymentContract | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Configuration form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [salaryFrequency, setSalaryFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [clauses, setClauses] = useState<ContractClause[]>([]);
  const [customClauses, setCustomClauses] = useState<string[]>([]);
  const [newCustomClause, setNewCustomClause] = useState('');

  // Signing state — separate names for each party
  const [employerName, setEmployerName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [signingAs, setSigningAs] = useState<'household' | 'househelp'>('household');

  // Load default clauses on mount and pre-fill from URL params
  useEffect(() => {
    if (!contractId) {
      fetchDefaultClauses();
      // Pre-filled from the job the contract is for.
      //
      // The household wrote all of this when they posted the advert — the
      // title, where the work is, when it starts, what it involves — and the
      // form asked for every word of it again. Retyping is not just tedious: a
      // second description of the same job can disagree with the one the
      // househelp answered, and it is the contract that binds.
      const paramJobType = searchParams.get('job_type');
      const paramSalary = searchParams.get('salary');
      const paramSalaryFreq = searchParams.get('salary_frequency');
      const paramStartDate = searchParams.get('start_date');
      const paramEndDate = searchParams.get('end_date');
      const paramLocation = searchParams.get('work_location');
      const paramDescription = searchParams.get('job_description');
      const paramNotes = searchParams.get('notes');
      if (paramJobType && !jobTitle) setJobTitle(paramJobType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
      if (paramSalary && !salary) setSalary(paramSalary);
      if (paramSalaryFreq) setSalaryFrequency(paramSalaryFreq);
      if (paramStartDate && !startDate) setStartDate(paramStartDate);
      if (paramEndDate && !endDate) setEndDate(paramEndDate);
      if (paramLocation && !workLocation) setWorkLocation(paramLocation);
      if (paramDescription && !jobDescription) setJobDescription(paramDescription);
      if (paramNotes && !notes) setNotes(paramNotes);
    }
  }, []);

  // Load existing contract if ID provided
  useEffect(() => {
    if (contractId) {
      fetchContract(contractId);
    }
  }, [contractId]);

  useEffect(() => {
    let cancelled = false;

    const resolveTargetHousehelp = async () => {
      const targetId = contract?.househelp_id || househelpId;
      if (!targetId) {
        if (!cancelled) setResolvedHousehelpProfileId('');
        return;
      }

      try {
        const profile = await resolveHousehelpProfile(targetId, { identifierType: 'auto' });
        const profileId = resolveHousehelpProfileId(profile) || targetId;
        if (!cancelled) {
          setResolvedHousehelpProfileId(profileId);
        }
      } catch {
        if (!cancelled) {
          setResolvedHousehelpProfileId(targetId);
        }
      }
    };

    resolveTargetHousehelp();

    return () => {
      cancelled = true;
    };
  }, [contract?.househelp_id, househelpId]);

  // Prefill the current user's name into the correct field based on their profile type
  useEffect(() => {
    if (user) {
      const u = (user as any).user || user;
      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
      if (!fullName) return;
      const pt = u.profile_type || localStorage.getItem('profile_type') || '';
      if (pt === 'household' && !employerName) setEmployerName(fullName);
      if (pt === 'househelp' && !employeeName) setEmployeeName(fullName);
    }
  }, [user]);

  // Prefill employee name from househelp profile when creating a new contract
  useEffect(() => {
    const fetchHousehelpName = async () => {
      const hhId = resolvedHousehelpProfileId || contract?.househelp_id || househelpId;
      if (!hhId) return;
      // If contract already has signer names, use those
      if (contract?.househelp_signer_name) {
        if (!employeeName) setEmployeeName(contract.househelp_signer_name);
        return;
      }
      if (contract?.household_signer_name) {
        if (!employerName) setEmployerName(contract.household_signer_name);
      }
      // Try to get name from contract's nested househelp object
      if (contract?.househelp) {
        const hh = contract.househelp;
        const name = `${hh.first_name || hh.user?.first_name || ''} ${hh.last_name || hh.user?.last_name || ''}`.trim();
        if (name && !employeeName) setEmployeeName(name);
        return;
      }
      // Fetch househelp profile to get their name
      try {
        const hh = await resolveHousehelpProfile(hhId, { identifierType: 'auto' });
        const profile = hh || {};
        const name = `${profile.first_name || profile.user?.first_name || ''} ${profile.last_name || profile.user?.last_name || ''}`.trim();
        if (name && !employeeName) setEmployeeName(name);
      } catch (err) {
        // Non-critical
      }
    };
    fetchHousehelpName();
  }, [contract, househelpId, resolvedHousehelpProfileId]);

  const fetchDefaultClauses = async () => {
    try {
      const raw = await employmentContractService.getDefaultClauses();
      // Unwrapped, and shaped the way this page renders a clause.
      //
      // This read `data.clauses` off the envelope rather than its body, so it
      // always found nothing — the panel rendered its heading and its
      // instructions above an empty list, and a contract went out with no terms
      // in it. The service also used to answer with bare strings, which this
      // page cannot draw: it wants a heading and a body it can show and let the
      // household switch off.
      const list = raw?.data?.clauses ?? raw?.clauses ?? [];
      const normalised: ContractClause[] = (Array.isArray(list) ? list : []).map(
        (entry: any, index: number) =>
          typeof entry === 'string'
            ? { id: `clause-${index}`, title: entry, body: '', included: true }
            : {
                id: String(entry?.id ?? `clause-${index}`),
                title: String(entry?.title ?? ''),
                body: String(entry?.body ?? ''),
                included: entry?.included !== false,
              },
      ).filter((clause) => clause.title || clause.body);
      setClauses(normalised);
    } catch (err) {
      console.error('Failed to fetch default clauses:', err);
    }
  };

  const fetchContract = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await employmentContractService.getEmploymentContract(id);
      const c = data?.data || data;
      setContract(c);
      // Populate form fields from existing contract
      setJobTitle(c.job_title || '');
      setJobDescription(c.job_description || '');
      setSalary(c.salary?.toString() || '');
      setSalaryFrequency(c.salary_frequency || 'monthly');
      setStartDate(c.start_date ? c.start_date.split('T')[0] : '');
      setEndDate(c.end_date ? c.end_date.split('T')[0] : '');
      setWorkLocation(c.work_location || '');
      setNotes(c.notes || '');
      setClauses(c.clauses || []);
      setCustomClauses(c.custom_clauses || []);
      // Lock to preview/view once any party has signed
      if (c.household_signed_at || c.househelp_signed_at) {
        setViewMode('preview');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    if (!jobTitle || !salary || !resolvedHousehelpProfileId) {
      setError('Job title, salary, and househelp are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body: any = {
        househelp_id: resolvedHousehelpProfileId,
        job_title: jobTitle,
        job_description: jobDescription,
        salary: parseFloat(salary),
        salary_frequency: salaryFrequency,
        work_location: workLocation,
        notes,
        clauses: clauses,
        custom_clauses: customClauses.filter(c => c.trim()),
      };
      if (hireContractId) body.hire_contract_id = hireContractId;
      if (startDate) body.start_date = new Date(startDate).toISOString();
      if (endDate) body.end_date = new Date(endDate).toISOString();

      const data = await employmentContractService.createEmploymentContract('', body);
      const newContract = data?.data || data;
      setContract(newContract);
      setViewMode('preview');
      setSuccess('Contract created successfully! Review the preview below.');
    } catch (err: any) {
      setError(err.message || 'Failed to create contract');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContract = async () => {
    if (!contract) return;
    setSaving(true);
    setError(null);
    try {
      const body: any = {
        job_title: jobTitle,
        job_description: jobDescription,
        salary: parseFloat(salary),
        salary_frequency: salaryFrequency,
        work_location: workLocation,
        notes,
        clauses: clauses,
        custom_clauses: customClauses.filter(c => c.trim()),
      };
      if (startDate) body.start_date = new Date(startDate).toISOString();
      if (endDate) body.end_date = new Date(endDate).toISOString();

      const data = await employmentContractService.updateEmploymentContract(contract.id, '', body);
      setContract(data?.data || data);
      setViewMode('preview');
      setSuccess('Contract updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update contract');
    } finally {
      setSaving(false);
    }
  };

  const [savingNames, setSavingNames] = useState(false);

  const handleAcceptAndSign = async (role: 'household' | 'househelp') => {
    if (!contract) return;
    const name = role === 'household' ? employerName.trim() : employeeName.trim();
    if (!name) {
      setError('Please enter your full legal name before signing');
      return;
    }
    setSavingNames(true);
    setError(null);
    try {
      // 1. Save the signer name on the contract (only possible while in draft status)
      if (contract.status === 'draft') {
        const nameField = role === 'household' ? 'household_signer_name' : 'househelp_signer_name';
        try {
          await employmentContractService.updateEmploymentContract(contract.id, '', { [nameField]: name });
        } catch {
          console.warn('Could not save name via PUT (contract may not be in draft)');
        }
      }

      // 2. Sign the contract for this party (signer_name is included in the sign request)
      if (role === 'household') {
        await employmentContractService.signByHousehold(contract.id, '', name, name);
      } else {
        await employmentContractService.signByHousehelp(contract.id, '', name, name);
      }

      // 3. If household just signed, also forward the contract to the househelp
      if (role === 'household') {
        try {
          await employmentContractService.forwardToHousehelp(contract.id);
        } catch (fwdErr: any) {
          // Don't throw — signing succeeded, forwarding is secondary
          console.warn('Forward failed:', fwdErr.message);
        }
      }

      // 4. Re-fetch the contract to get updated state
      await fetchContract(contract.id);
      setSuccess(role === 'household'
        ? 'Signed and forwarded! The househelp can now review and sign.'
        : 'Signed! Both parties have now signed the contract.');
    } catch (err: any) {
      setError(err.message || 'Failed to sign');
    } finally {
      setSavingNames(false);
    }
  };

  const signerName = signingAs === 'household' ? employerName : employeeName;

  // Whether there is anything here to sign.
  //
  // A draft created by "send contract" starts empty, and the househelp could
  // sign it in that state — a document with no position, no pay and no dates.
  const contractHasTerms = Boolean(
    contract && (contract.job_title || contract.salary || contract.start_date),
  );

  const handleSign = async () => {
    if (!contract || !signerName.trim()) {
      setError('Please enter your full legal name to sign');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let data: any;
      if (signingAs === 'household') {
        data = await employmentContractService.signByHousehold(contract.id, '', signerName.trim(), signerName.trim());
      } else {
        data = await employmentContractService.signByHousehelp(contract.id, '', signerName.trim(), signerName.trim());
      }
      setContract(data?.data || data);
      setShowSigningModal(false);
      setSuccess(signingAs === 'household'
        ? 'Contract signed! You can now forward it to the househelp.'
        : 'Contract signed! Both parties have now signed.');
    } catch (err: any) {
      setError(err.message || 'Failed to sign contract');
    } finally {
      setSaving(false);
    }
  };

  const handleForward = async () => {
    if (!contract) return;
    setSaving(true);
    setError(null);
    try {
      await employmentContractService.forwardToHousehelp(contract.id);
      await fetchContract(contract.id);
      setSuccess('Contract forwarded to househelp! They will be notified via SMS and email.');
    } catch (err: any) {
      setError(err.message || 'Failed to forward contract');
    } finally {
      setSaving(false);
    }
  };

  // Pre-fill email from user record when opening modal
  const openEmailModal = () => {
    const u = (user as any)?.user || user;
    const userEmail = u?.email || '';
    if (!emailAddress) setEmailAddress(userEmail);
    setShowEmailModal(true);
  };

  const handleSendContractEmail = async () => {
    if (!contract || !emailAddress.trim()) return;
    setEmailSending(true);
    setError(null);
    try {
      // Rendered by the server from the contract's own rows, so the attachment
      // is the agreement rather than a picture of this page.
      const uint8Array = await contractPdfBytes(contract.id);

      const userObj = (user as any)?.user || user;
      const firstName = userObj?.first_name || 'there';
      const contractUrl = `${window.location.origin}/household/employment-contract?id=${contract.id}`;

      await notificationsService.sendEmail({
        to: emailAddress.trim(),
        subject: `Employment Contract - ${contract.job_title || 'Homebit'}`,
        body: '',
        isHtml: false,
        templateName: 'employment-contract',
        variables: {
          firstName,
          jobTitle: contract.job_title || 'Employment Position',
          employerName: contract.household_signer_name || '',
          employeeName: contract.househelp_signer_name || '',
          startDate: contract.start_date ? new Date(contract.start_date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
          contractUrl,
        },
        attachmentData: uint8Array,
        attachmentName: `Employment-Contract-${contract.job_title || 'Homebit'}.pdf`,
        attachmentType: 'application/pdf',
      });
      setShowEmailModal(false);
      setSuccess(`Contract emailed to ${emailAddress.trim()} successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  const handleDownload = async () => {
    if (!contract) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadContractPdf(contract.id);
    } catch (err: any) {
      setError(err?.message || 'We could not produce that document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const toggleClause = (id: string) => {
    setClauses(prev => prev.map(c => c.id === id ? { ...c, included: !c.included } : c));
  };

  const addCustomClause = () => {
    if (newCustomClause.trim()) {
      setCustomClauses(prev => [...prev, newCustomClause.trim()]);
      setNewCustomClause('');
    }
  };

  const removeCustomClause = (index: number) => {
    setCustomClauses(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const userObj = (user as any)?.user || user;
  const profileType = userObj?.profile_type || localStorage.getItem('profile_type') || '';
  const isHousehold = profileType === 'household';
  const isHousehelp = profileType === 'househelp';
  const isSignedByBoth = contract?.household_signed_at && contract?.househelp_signed_at;
  // Anyone party to it can take a copy, signed or not.
  //
  // This used to wait for both signatures, because the old download was a
  // screenshot of the page with nothing on it to say whether it had been agreed,
  // so an unsigned copy could be mistaken for a real one. The rendered document
  // states its status across the top — "AWAITING THE HOUSEHELP'S SIGNATURE" — and
  // leaves an unsigned party's line blank, so it cannot be mistaken for anything.
  //
  // Reading an offer away from the site is exactly when somebody wants it:
  // to think it over, or to show it to a family member before signing.
  const canDownload = !!contract;
  const handleBackNavigation = () => navigate(backTo, { replace: true });

  if (loading) {
    return (
      <div className="py-10">
        <FormPageSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-3xl bg-white shadow-xl border border-purple-100 px-4 sm:px-8 py-8 dark:bg-gradient-to-b dark:from-[#1a102b] dark:via-[#0e0a1a] dark:to-[#07050d] dark:border-purple-800/40 dark:shadow-2xl dark:shadow-purple-900/50 transition-colors">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={handleBackNavigation} aria-label={backLabel} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-purple-600 dark:text-purple-300" />
          </button>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1 dark:text-purple-300">
              {isHousehelp ? 'Househelp' : 'Household'} • Contract
            </p>
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white">
              {contractId ? 'Employment Contract' : 'Create Employment Contract'}
            </h1>
            <p className="text-xs text-gray-600 dark:text-purple-200">
              {viewMode === 'configure' ? 'Configure your contract terms and clauses' :
               viewMode === 'preview' ? 'Review and sign your contract' :
               'View contract details'}
            </p>
          </div>
          {/* View mode toggle */}
          {contract && contract.status === 'draft' && isHousehold && !contract.household_signed_at && !contract.househelp_signed_at && (
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('configure')}
                className={`px-4 py-1.5 text-xs rounded-xl font-semibold transition-all ${viewMode === 'configure' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 dark:bg-purple-900/30 text-gray-700 dark:text-purple-200 border border-purple-200 dark:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/50'}`}
              >
                <Edit3 className="w-4 h-4 inline mr-1" /> Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-1.5 text-xs rounded-xl font-semibold transition-all ${viewMode === 'preview' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 dark:bg-purple-900/30 text-gray-700 dark:text-purple-200 border border-purple-200 dark:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/50'}`}
              >
                <FileText className="w-4 h-4 inline mr-1" /> Preview
              </button>
            </div>
          )}
        </div>

        {/* Status Banner */}
        {contract && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            contract.status === 'signed_by_both' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
            contract.status === 'pending_househelp' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
            contract.status === 'draft' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' :
            'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}>
            {contract.status === 'signed_by_both' && <CheckCircle className="w-5 h-5" />}
            {contract.status === 'pending_househelp' && <AlertCircle className="w-5 h-5" />}
            {contract.status === 'draft' && <FileText className="w-5 h-5" />}
            {/* Said from the side of whoever is reading it.
                Every line here was written for the household, so a househelp
                who had just signed was told the page was "awaiting househelp
                signature" — waiting, apparently, for themselves. Both sides
                open this same page. */}
            <span className="font-medium">
              {contract.status === 'signed_by_both' || (contract.household_signed_at && contract.househelp_signed_at)
                ? 'Signed by both of you'
                : contract.household_signed_at && !contract.househelp_signed_at
                  ? (isHousehelp ? 'Waiting for your signature' : 'Waiting for the househelp to sign')
                  : contract.househelp_signed_at && !contract.household_signed_at
                    ? (isHousehelp ? 'Signed — waiting for the household' : 'Waiting for your signature')
                    : contract.status === 'terminated'
                      ? 'Terminated'
                      : contract.status === 'active'
                        ? 'Active contract'
                        : (isHousehelp ? 'Not signed yet' : 'Draft — sign and send it to them')}
            </span>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-xl flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">✕</button>
          </div>
        )}

        {/* ═══ CONFIGURE MODE ═══ (blocked once any party has signed) */}
        {viewMode === 'configure' && !contract?.household_signed_at && !contract?.househelp_signed_at && (
          // Tightened: every card was p-6 with 2.5-high fields and three-row
          // text areas, so a form of nine inputs ran past a laptop screen and
          // the clause list — the part that needs reading — sat below the fold.
          <div className="space-y-4">
            {/* Contract Details */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 dark:bg-purple-900/20 dark:border-purple-700/50">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contract Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">Job Title *</label>
                  <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                    className="w-full px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                    placeholder="e.g. Live-in Househelp" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">Work Location</label>
                  <input type="text" value={workLocation} onChange={e => setWorkLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                    placeholder="e.g. Nairobi, Kilimani" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">Salary (KES) *</label>
                  <input type="number" value={salary} onChange={e => setSalary(e.target.value)}
                    className="w-full px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                    placeholder="e.g. 15000" />
                  {postedSalary && !contractId && (
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-purple-300">
                      Your advert said {postedSalary}. Enter the figure you agreed.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">Salary Frequency *</label>
                  <CustomSelect
                    value={salaryFrequency}
                    onChange={setSalaryFrequency}
                    ariaLabel="Salary frequency"
                    options={[
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'bi-weekly', label: 'Bi-weekly' },
                      { value: 'daily', label: 'Daily' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">End Date (optional)</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">Job Description</label>
                <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={2}
                  className="w-full px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none"
                  placeholder="Describe the duties and responsibilities..." />
              </div>
              <div className="mt-4">
                <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">Additional Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none"
                  placeholder="Any additional notes..." />
              </div>
            </div>

            {/* Contract Clauses */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 dark:bg-purple-900/20 dark:border-purple-700/50">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Contract Clauses</h2>
              <p className="text-xs text-gray-500 dark:text-purple-300 mb-3">Select which clauses to include in the contract. All are included by default.</p>
              <div className="space-y-1">
                {clauses.map((clause) => (
                  <label key={clause.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={clause.included}
                      onChange={() => toggleClause(clause.id)}
                      className="mt-0.5 w-3.5 h-3.5 text-purple-600 border-purple-300 dark:border-purple-500/50 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{clause.title}</span>
                      <p className="text-xs text-gray-600 dark:text-purple-200 mt-1">{clause.body}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Clauses */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 dark:bg-purple-900/20 dark:border-purple-700/50">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Additional Clauses</h2>
              <p className="text-xs text-gray-500 dark:text-purple-300 mb-3">Add any custom clauses you'd like to include.</p>
              {customClauses.map((clause, index) => (
                <div key={index} className="flex items-start gap-2 mb-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-100 dark:border-purple-700/40">
                  <span className="flex-1 text-xs text-gray-800 dark:text-purple-100">{clause}</span>
                  <button onClick={() => removeCustomClause(index)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomClause}
                  onChange={e => setNewCustomClause(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomClause()}
                  className="flex-1 px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                  placeholder="Type a custom clause and press Enter or click Add"
                />
                <button onClick={addCustomClause}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button onClick={handleBackNavigation}
                className="px-4 py-1.5 border border-purple-200 dark:border-purple-700/50 text-gray-700 dark:text-purple-200 rounded-lg text-xs hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all font-semibold">
                Cancel
              </button>
              <button
                onClick={contract ? handleUpdateContract : handleCreateContract}
                disabled={saving}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <span className="hb-shimmer-piece h-4 w-4 rounded-full" />}
                {contract ? 'Update & Preview' : 'Create & Preview'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ PREVIEW / VIEW MODE ═══ */}
        {(viewMode === 'preview' || viewMode === 'view') && contract && (
          <div className="space-y-6">
            {/* Contract Document Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 dark:border-purple-700/50 overflow-hidden">
              <div ref={printRef} className="p-8 md:p-12" style={{ background: 'white', color: '#1a1a1a' }}>
                {/* Contract Header */}
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">EMPLOYMENT CONTRACT</h1>
                  <p className="text-xs text-gray-500">
                    Contract ID: {contract.id.slice(0, 8).toUpperCase()} &bull; Created: {formatDate(contract.created_at)}
                  </p>
                </div>

                {/* Parties */}
                <div className="mb-8">
                  <h2 className="text-base font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">Parties</h2>
                  <p className="text-gray-700 mb-2">
                    <strong>Employer (Household):</strong> {contract.household_signer_name || 'Pending signature'}
                  </p>
                  <p className="text-gray-700">
                    <strong>Employee (Househelp):</strong> {contract.househelp_signer_name || 'Pending signature'}
                  </p>
                </div>

                {/* Terms */}
                <div className="mb-8">
                  <h2 className="text-base font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">Terms of Employment</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
                    {/* A term nobody has filled in says so.
                        "As agreed" reads like something the two of them settled
                        between themselves; blank pay rendered as "KES /". On a
                        document somebody is about to sign, an unfilled term must
                        not look like a decided one. */}
                    <div><strong>Position:</strong> {contract.job_title || <em className="text-gray-400">Not set</em>}</div>
                    <div><strong>Location:</strong> {contract.work_location || <em className="text-gray-400">Not set</em>}</div>
                    <div>
                      <strong>Salary:</strong>{' '}
                      {contract.salary
                        ? `KES ${contract.salary.toLocaleString()} / ${contract.salary_frequency || 'month'}`
                        : <em className="text-gray-400">Not set</em>}
                    </div>
                    <div>
                      <strong>Start Date:</strong>{' '}
                      {contract.start_date ? formatDate(contract.start_date) : <em className="text-gray-400">Not set</em>}
                    </div>
                    {contract.end_date && <div><strong>End Date:</strong> {formatDate(contract.end_date)}</div>}
                  </div>
                  {contract.job_description && (
                    <div className="mt-4">
                      <strong className="text-gray-900">Job Description:</strong>
                      <p className="text-gray-700 mt-1">{contract.job_description}</p>
                    </div>
                  )}
                </div>

                {/* Clauses */}
                <div className="mb-8">
                  <h2 className="text-base font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">Terms & Conditions</h2>
                  {contract.clauses?.filter((c: ContractClause) => c.included).map((clause: ContractClause, idx: number) => (
                    <div key={clause.id} className="mb-4">
                      <p className="font-semibold text-gray-900">{idx + 1}. {clause.title}</p>
                      <p className="text-gray-700 text-xs mt-1 ml-4">{clause.body}</p>
                    </div>
                  ))}
                  {contract.custom_clauses?.filter((c: string) => c.trim()).map((clause: string, idx: number) => (
                    <div key={`custom-${idx}`} className="mb-4">
                      <p className="font-semibold text-gray-900">
                        {(contract.clauses?.filter((c: ContractClause) => c.included).length || 0) + idx + 1}. Additional Clause
                      </p>
                      <p className="text-gray-700 text-xs mt-1 ml-4">{clause}</p>
                    </div>
                  ))}
                </div>

                {contract.notes && (
                  <div className="mb-8">
                    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">Additional Notes</h2>
                    <p className="text-gray-700 text-xs">{contract.notes}</p>
                  </div>
                )}

                {/* Signatures */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-3">
                      {contract.household_signed_at ? (
                        <>
                          <p className="font-semibold text-gray-900">{contract.household_signer_name}</p>
                          <p className="text-xs text-gray-500">Signed: {formatDate(contract.household_signed_at)}</p>
                        </>
                      ) : (
                        <p className="font-medium text-gray-700">{employerName || 'Awaiting signature'}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">Employer</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-3">
                      {contract.househelp_signed_at ? (
                        <>
                          <p className="font-semibold text-gray-900">{contract.househelp_signer_name}</p>
                          <p className="text-xs text-gray-500">Signed: {formatDate(contract.househelp_signed_at)}</p>
                        </>
                      ) : (
                        <p className="font-medium text-gray-700">{employeeName || 'Awaiting signature'}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">Employee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Signer Names */}
            {contract && (!contract.household_signed_at || !contract.househelp_signed_at) && (
              <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 dark:bg-purple-900/20 dark:border-purple-700/50">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Signer Names</h3>
                <p className="text-xs text-gray-500 dark:text-purple-300 mb-3">
                  These names will appear on the contract. Edit if needed before signing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Employer (Household) side */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400">
                      Employer (Household)
                    </label>
                    <input
                      type="text"
                      value={employerName}
                      onChange={e => setEmployerName(e.target.value)}
                      disabled={!!contract.household_signed_at || !isHousehold}
                      className="w-full px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Full legal name"
                    />
                    {contract.household_signed_at ? (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Signed on {formatDate(contract.household_signed_at)}
                      </p>
                    ) : (
                      <button
                        onClick={() => handleAcceptAndSign('household')}
                        disabled={savingNames || !employerName.trim() || !isHousehold || !contractHasTerms}
                        className={`w-full px-4 py-2.5 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 ${
                          isHousehold
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 disabled:opacity-50'
                            : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {savingNames && isHousehold ? <span className="hb-shimmer-piece h-4 w-4 rounded-full" /> : <Check className="w-4 h-4" />}
                        {isHousehold ? 'Accept & Sign' : 'Awaiting Employer'}
                      </button>
                    )}
                  </div>

                  {/* Employee (Househelp) side */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400">
                      Employee (Househelp)
                    </label>
                    <input
                      type="text"
                      value={employeeName}
                      onChange={e => setEmployeeName(e.target.value)}
                      disabled={!!contract.househelp_signed_at || !isHousehelp}
                      className="w-full px-3 py-1.5 border border-purple-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Full legal name"
                    />
                    {contract.househelp_signed_at ? (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Signed on {formatDate(contract.househelp_signed_at)}
                      </p>
                    ) : (
                      <button
                        onClick={() => handleAcceptAndSign('househelp')}
                        disabled={savingNames || !employeeName.trim() || !isHousehelp || !contractHasTerms}
                        className={`w-full px-4 py-2.5 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 ${
                          isHousehelp
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 disabled:opacity-50'
                            : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {savingNames && isHousehelp ? <span className="hb-shimmer-piece h-4 w-4 rounded-full" /> : <Check className="w-4 h-4" />}
                        {isHousehelp ? 'Accept & Sign' : 'Awaiting Employee'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              {/* Download - only when both signed */}
              {canDownload && (
                <button onClick={handleDownload} disabled={downloading}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30 flex items-center gap-2 disabled:opacity-60">
                  <Download className="w-4 h-4" /> {downloading ? 'Preparing PDF…' : 'Download PDF'}
                </button>
              )}

              {/* Email contract */}
              {canDownload && (
                <button onClick={openEmailModal}
                  className="px-6 py-2.5 border-2 border-purple-200 dark:border-purple-700/50 text-gray-700 dark:text-purple-200 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Contract
                </button>
              )}

              {contract && !isSignedByBoth && (
                <p className="w-full text-right text-xs text-gray-500 dark:text-purple-300/70">
                  The PDF will show this contract as still awaiting a signature.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ═══ SIGNING MODAL ═══ */}
        {showSigningModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowSigningModal(false)} />
            <div className="relative bg-white dark:bg-[#0d0d15] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-200/50 dark:border-purple-600/40 w-full sm:max-w-md p-6 sm:p-8 animate-slide-up sm:mx-4">
              <button
                type="button"
                onClick={() => setShowSigningModal(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full border border-purple-200 p-1.5 text-gray-500 transition hover:bg-purple-50 hover:text-gray-900 dark:border-purple-500/30 dark:text-gray-300 dark:hover:bg-purple-500/15 dark:hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-2">Sign Contract</h3>
              <p className="text-xs text-gray-600 dark:text-purple-200 mb-4">
                Enter your full legal name to sign this contract. This serves as your digital signature.
              </p>
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={e => signingAs === 'household' ? setEmployerName(e.target.value) : setEmployeeName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all text-base"
                  placeholder="e.g. John Kamau Mwangi"
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-purple-300 mt-1">
                  Pre-filled from your profile. You may update it if needed.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowSigningModal(false)}
                  className="px-5 py-2 border-2 border-purple-200 dark:border-purple-700/50 text-gray-700 dark:text-purple-200 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all font-semibold">
                  Cancel
                </button>
                <button onClick={handleSign} disabled={saving || !signerName.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2">
                  {saving ? <span className="hb-shimmer-piece h-4 w-4 rounded-full" /> : <Check className="w-4 h-4" />}
                  Sign Contract
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ EMAIL CONTRACT MODAL ═══ */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowEmailModal(false)} />
            <div className="relative bg-white dark:bg-[#0d0d15] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-200/50 dark:border-purple-600/40 w-full sm:max-w-md p-6 sm:p-8 animate-slide-up sm:mx-4">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full border border-purple-200 p-1.5 text-gray-500 transition hover:bg-purple-50 hover:text-gray-900 dark:border-purple-500/30 dark:text-gray-300 dark:hover:bg-purple-500/15 dark:hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-2">Email Contract</h3>
              <p className="text-xs text-gray-600 dark:text-purple-200 mb-4">
                We'll send a copy of the signed contract to the email address below.
              </p>
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={e => setEmailAddress(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all text-base"
                  placeholder="e.g. jane@example.com"
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-purple-300 mt-1">
                  Pre-filled from your account. You can change it to any email.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowEmailModal(false)}
                  className="px-5 py-2 border-2 border-purple-200 dark:border-purple-700/50 text-gray-700 dark:text-purple-200 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all font-semibold">
                  Cancel
                </button>
                <button onClick={handleSendContractEmail} disabled={emailSending || !emailAddress.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2">
                  {emailSending ? <span className="hb-shimmer-piece h-4 w-4 rounded-full" /> : <Mail className="w-4 h-4" />}
                  {emailSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
