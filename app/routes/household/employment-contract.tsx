import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { API_ENDPOINTS, API_BASE_URL } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import { useAuth } from '~/contexts/useAuth';
import {
  FileText, CheckCircle, XCircle, Download, Mail, Send,
  ChevronLeft, Edit3, Check, AlertCircle, Loader2, Plus, Trash2
} from 'lucide-react';

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
  const printRef = useRef<HTMLDivElement>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

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
  const [signingAs, setSigningAs] = useState<'household' | 'househelp'>('household');

  // Load default clauses on mount and pre-fill from URL params
  useEffect(() => {
    if (!contractId) {
      fetchDefaultClauses();
      // Pre-fill from URL params (when coming from hire request)
      const paramJobType = searchParams.get('job_type');
      const paramSalary = searchParams.get('salary');
      const paramSalaryFreq = searchParams.get('salary_frequency');
      const paramStartDate = searchParams.get('start_date');
      const paramNotes = searchParams.get('notes');
      if (paramJobType && !jobTitle) setJobTitle(paramJobType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
      if (paramSalary && !salary) setSalary(paramSalary);
      if (paramSalaryFreq && !salaryFrequency) setSalaryFrequency(paramSalaryFreq);
      if (paramStartDate && !startDate) setStartDate(paramStartDate);
      if (paramNotes && !notes) setNotes(paramNotes);
    }
  }, []);

  // Load existing contract if ID provided
  useEffect(() => {
    if (contractId) {
      fetchContract(contractId);
    }
  }, [contractId]);

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
      const hhId = househelpId || contract?.househelp_id;
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
        const response = await apiClient.auth(API_ENDPOINTS.profile.househelp.byId(hhId));
        if (response.ok) {
          const data = await response.json();
          const hh = data.data || data;
          const name = `${hh.first_name || hh.user?.first_name || ''} ${hh.last_name || hh.user?.last_name || ''}`.trim();
          if (name && !employeeName) setEmployeeName(name);
        }
      } catch (err) {
        // Non-critical
      }
    };
    fetchHousehelpName();
  }, [househelpId, contract]);

  const fetchDefaultClauses = async () => {
    try {
      const response = await apiClient.auth(API_ENDPOINTS.hiring.employmentContracts.clauses);
      if (response.ok) {
        const data = await response.json();
        setClauses(data.data?.clauses || data.clauses || []);
      }
    } catch (err) {
      console.error('Failed to fetch default clauses:', err);
    }
  };

  const fetchContract = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.auth(API_ENDPOINTS.hiring.employmentContracts.byId(id));
      if (!response.ok) throw new Error('Failed to fetch contract');
      const data = await response.json();
      const c = data.data || data;
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
    if (!jobTitle || !salary || !househelpId) {
      setError('Job title, salary, and househelp are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body: any = {
        househelp_id: househelpId,
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

      const response = await apiClient.auth(API_ENDPOINTS.hiring.employmentContracts.base, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create contract');
      }
      const data = await response.json();
      const newContract = data.data || data;
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

      const response = await apiClient.auth(API_ENDPOINTS.hiring.employmentContracts.byId(contract.id), {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Failed to update contract');
      const data = await response.json();
      setContract(data.data || data);
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
        const updateRes = await apiClient.auth(API_ENDPOINTS.hiring.employmentContracts.byId(contract.id), {
          method: 'PUT',
          body: JSON.stringify({ [nameField]: name }),
        });
        if (!updateRes.ok) {
          console.warn('Could not save name via PUT (contract may not be in draft)');
        }
      }

      // 2. Sign the contract for this party (signer_name is included in the sign request)
      const endpoint = role === 'household'
        ? API_ENDPOINTS.hiring.employmentContracts.signHousehold(contract.id)
        : API_ENDPOINTS.hiring.employmentContracts.signHousehelp(contract.id);

      const signRes = await apiClient.auth(endpoint, {
        method: 'POST',
        body: JSON.stringify({ signature: name, signer_name: name }),
      });
      if (!signRes.ok) {
        const err = await signRes.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to sign contract');
      }

      // 3. If household just signed, also forward the contract to the househelp
      if (role === 'household') {
        const fwdRes = await apiClient.auth(API_ENDPOINTS.hiring.employmentContracts.forward(contract.id), {
          method: 'POST',
        });
        if (!fwdRes.ok) {
          const err = await fwdRes.json().catch(() => ({}));
          // Don't throw — signing succeeded, forwarding is secondary
          console.warn('Forward failed:', err.message);
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

  const handleSign = async () => {
    if (!contract || !signerName.trim()) {
      setError('Please enter your full legal name to sign');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const endpoint = signingAs === 'household'
        ? API_ENDPOINTS.hiring.employmentContracts.signHousehold(contract.id)
        : API_ENDPOINTS.hiring.employmentContracts.signHousehelp(contract.id);

      const response = await apiClient.auth(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          signature: signerName.trim(),
          signer_name: signerName.trim(),
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to sign contract');
      }
      const data = await response.json();
      setContract(data.data || data);
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
      const response = await apiClient.auth(API_ENDPOINTS.hiring.employmentContracts.forward(contract.id), {
        method: 'POST',
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to forward contract');
      }
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
    if (!contract || !printRef.current || !emailAddress.trim()) return;
    setEmailSending(true);
    setError(null);
    try {
      // Generate PDF from contract HTML
      const html2pdf = (await import('html2pdf.js')).default;
      const pdfBlob: Blob = await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `employment-contract-${contract.id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(printRef.current)
        .outputPdf('blob');

      // Convert PDF blob to base64
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const pdfBase64 = btoa(binary);

      const userObj = (user as any)?.user || user;
      const firstName = userObj?.first_name || 'there';
      const contractUrl = `${window.location.origin}/household/employment-contract?id=${contract.id}`;

      const response = await apiClient.auth(
        `${API_BASE_URL}/api/v1/email/send`,
        {
          method: 'POST',
          body: JSON.stringify({
            to: emailAddress.trim(),
            subject: `Employment Contract - ${contract.job_title || 'Homebit'}`,
            template_name: 'employment-contract',
            variables: {
              firstName,
              jobTitle: contract.job_title || 'Employment Position',
              employerName: contract.household_signer_name || '',
              employeeName: contract.househelp_signer_name || '',
              startDate: contract.start_date ? new Date(contract.start_date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
              contractUrl,
            },
            attachment_data: pdfBase64,
            attachment_name: `Employment-Contract-${contract.job_title || 'Homebit'}.pdf`,
            attachment_type: 'application/pdf',
          }),
        }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || err.message || 'Failed to send email');
      }
      setShowEmailModal(false);
      setSuccess(`Contract emailed to ${emailAddress.trim()} successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  const handleDownload = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Employment Contract</title>
          <style>
            body { font-family: 'Georgia', serif; padding: 40px; max-width: 800px; margin: 0 auto; background: white; color: #1a1a1a; }
            h1 { text-align: center; font-size: 24px; margin-bottom: 8px; }
            h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
            .clause { margin-bottom: 16px; }
            .clause-title { font-weight: bold; margin-bottom: 4px; }
            .signature-block { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature-line { border-top: 1px solid #333; padding-top: 8px; width: 45%; text-align: center; }
            .meta { text-align: center; color: #666; font-size: 14px; margin-bottom: 24px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${printRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
  const canDownload = !!isSignedByBoth;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-3xl bg-white shadow-xl border border-purple-100 px-4 sm:px-8 py-8 dark:bg-gradient-to-b dark:from-[#1a102b] dark:via-[#0e0a1a] dark:to-[#07050d] dark:border-purple-800/40 dark:shadow-2xl dark:shadow-purple-900/50 transition-colors">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-purple-600 dark:text-purple-300" />
          </button>
          <div className="flex-1">
            <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-1 dark:text-purple-300">
              Household • Contract
            </p>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {contractId ? 'Employment Contract' : 'Create Employment Contract'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-purple-200">
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
                className={`px-4 py-1.5 text-sm rounded-xl font-semibold transition-all ${viewMode === 'configure' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 dark:bg-purple-900/30 text-gray-700 dark:text-purple-200 border border-purple-200 dark:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/50'}`}
              >
                <Edit3 className="w-4 h-4 inline mr-1" /> Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-1.5 text-sm rounded-xl font-semibold transition-all ${viewMode === 'preview' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 dark:bg-purple-900/30 text-gray-700 dark:text-purple-200 border border-purple-200 dark:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/50'}`}
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
            <span className="font-medium">
              {contract.status === 'draft' && !contract.household_signed_at && 'Draft — Sign and forward to househelp'}
              {contract.status === 'draft' && contract.household_signed_at && 'Signed by you — Forward to househelp for their signature'}
              {contract.status === 'pending_househelp' && 'Awaiting househelp signature'}
              {contract.status === 'signed_by_both' && 'Fully signed by both parties'}
              {contract.status === 'active' && 'Active contract'}
              {contract.status === 'terminated' && 'Terminated'}
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
          <div className="space-y-6">
            {/* Contract Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 dark:bg-purple-900/20 dark:border-purple-700/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contract Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Job Title *</label>
                  <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                    placeholder="e.g. Live-in Househelp" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Work Location</label>
                  <input type="text" value={workLocation} onChange={e => setWorkLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                    placeholder="e.g. Nairobi, Kilimani" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Salary (KES) *</label>
                  <input type="number" value={salary} onChange={e => setSalary(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                    placeholder="e.g. 15000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Salary Frequency *</label>
                  <select value={salaryFrequency} onChange={e => setSalaryFrequency(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all">
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">End Date (optional)</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Job Description</label>
                <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none"
                  placeholder="Describe the duties and responsibilities..." />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Additional Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none"
                  placeholder="Any additional notes..." />
              </div>
            </div>

            {/* Contract Clauses */}
            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 dark:bg-purple-900/20 dark:border-purple-700/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contract Clauses</h2>
              <p className="text-sm text-gray-500 dark:text-purple-300 mb-4">Select which clauses to include in the contract. All are included by default.</p>
              <div className="space-y-3">
                {clauses.map((clause) => (
                  <label key={clause.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={clause.included}
                      onChange={() => toggleClause(clause.id)}
                      className="mt-1 w-4 h-4 text-purple-600 border-purple-300 dark:border-purple-500/50 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">{clause.title}</span>
                      <p className="text-sm text-gray-600 dark:text-purple-200 mt-1">{clause.body}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Clauses */}
            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 dark:bg-purple-900/20 dark:border-purple-700/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Additional Clauses</h2>
              <p className="text-sm text-gray-500 dark:text-purple-300 mb-4">Add any custom clauses you'd like to include.</p>
              {customClauses.map((clause, index) => (
                <div key={index} className="flex items-start gap-2 mb-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-100 dark:border-purple-700/40">
                  <span className="flex-1 text-sm text-gray-800 dark:text-purple-100">{clause}</span>
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
                  className="flex-1 px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
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
              <button onClick={() => navigate(-1)}
                className="px-6 py-2.5 border-2 border-purple-200 dark:border-purple-700/50 text-gray-700 dark:text-purple-200 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all font-semibold">
                Cancel
              </button>
              <button
                onClick={contract ? handleUpdateContract : handleCreateContract}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">EMPLOYMENT CONTRACT</h1>
                  <p className="text-sm text-gray-500">
                    Contract ID: {contract.id.slice(0, 8).toUpperCase()} &bull; Created: {formatDate(contract.created_at)}
                  </p>
                </div>

                {/* Parties */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">Parties</h2>
                  <p className="text-gray-700 mb-2">
                    <strong>Employer (Household):</strong> {contract.household_signer_name || 'Pending signature'}
                  </p>
                  <p className="text-gray-700">
                    <strong>Employee (Househelp):</strong> {contract.househelp_signer_name || 'Pending signature'}
                  </p>
                </div>

                {/* Terms */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">Terms of Employment</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <div><strong>Position:</strong> {contract.job_title}</div>
                    <div><strong>Location:</strong> {contract.work_location || 'As agreed'}</div>
                    <div><strong>Salary:</strong> KES {contract.salary?.toLocaleString()} / {contract.salary_frequency}</div>
                    <div><strong>Start Date:</strong> {contract.start_date ? formatDate(contract.start_date) : 'As agreed'}</div>
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
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">Terms & Conditions</h2>
                  {contract.clauses?.filter((c: ContractClause) => c.included).map((clause: ContractClause, idx: number) => (
                    <div key={clause.id} className="mb-4">
                      <p className="font-semibold text-gray-900">{idx + 1}. {clause.title}</p>
                      <p className="text-gray-700 text-sm mt-1 ml-4">{clause.body}</p>
                    </div>
                  ))}
                  {contract.custom_clauses?.filter((c: string) => c.trim()).map((clause: string, idx: number) => (
                    <div key={`custom-${idx}`} className="mb-4">
                      <p className="font-semibold text-gray-900">
                        {(contract.clauses?.filter((c: ContractClause) => c.included).length || 0) + idx + 1}. Additional Clause
                      </p>
                      <p className="text-gray-700 text-sm mt-1 ml-4">{clause}</p>
                    </div>
                  ))}
                </div>

                {contract.notes && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">Additional Notes</h2>
                    <p className="text-gray-700 text-sm">{contract.notes}</p>
                  </div>
                )}

                {/* Signatures */}
                <div className="mt-12 grid grid-cols-2 gap-8">
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
                      <p className="text-sm text-gray-600 mt-1">Employer</p>
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
                      <p className="text-sm text-gray-600 mt-1">Employee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Signer Names */}
            {contract && (!contract.household_signed_at || !contract.househelp_signed_at) && (
              <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 dark:bg-purple-900/20 dark:border-purple-700/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Signer Names</h3>
                <p className="text-xs text-gray-500 dark:text-purple-300 mb-4">
                  These names will appear on the contract. Edit if needed before signing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Employer (Household) side */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400">
                      Employer (Household)
                    </label>
                    <input
                      type="text"
                      value={employerName}
                      onChange={e => setEmployerName(e.target.value)}
                      disabled={!!contract.household_signed_at || !isHousehold}
                      className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Full legal name"
                    />
                    {contract.household_signed_at ? (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Signed on {formatDate(contract.household_signed_at)}
                      </p>
                    ) : (
                      <button
                        onClick={() => handleAcceptAndSign('household')}
                        disabled={savingNames || !employerName.trim() || !isHousehold}
                        className={`w-full px-4 py-2.5 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 ${
                          isHousehold
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 disabled:opacity-50'
                            : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {savingNames && isHousehold ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {isHousehold ? 'Accept & Sign' : 'Awaiting Employer'}
                      </button>
                    )}
                  </div>

                  {/* Employee (Househelp) side */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400">
                      Employee (Househelp)
                    </label>
                    <input
                      type="text"
                      value={employeeName}
                      onChange={e => setEmployeeName(e.target.value)}
                      disabled={!!contract.househelp_signed_at || !isHousehelp}
                      className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Full legal name"
                    />
                    {contract.househelp_signed_at ? (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Signed on {formatDate(contract.househelp_signed_at)}
                      </p>
                    ) : (
                      <button
                        onClick={() => handleAcceptAndSign('househelp')}
                        disabled={savingNames || !employeeName.trim() || !isHousehelp}
                        className={`w-full px-4 py-2.5 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 ${
                          isHousehelp
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 disabled:opacity-50'
                            : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {savingNames && isHousehelp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
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
                <button onClick={handleDownload}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Contract
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

              {/* Not signed by both - show disabled download with tooltip */}
              {!canDownload && contract && (
                <div className="relative group">
                  <button disabled
                    className="px-6 py-2.5 bg-purple-200/50 dark:bg-purple-900/30 text-purple-400 dark:text-purple-500 rounded-xl cursor-not-allowed flex items-center gap-2 border border-purple-200 dark:border-purple-700/40">
                    <Download className="w-4 h-4" /> Download Contract
                  </button>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    Both parties must sign before downloading
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ SIGNING MODAL ═══ */}
        {showSigningModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0d0d15] rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/20 border border-purple-200/50 dark:border-purple-600/40 max-w-md w-full p-6 sm:p-8">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">Sign Contract</h3>
              <p className="text-sm text-gray-600 dark:text-purple-200 mb-4">
                Enter your full legal name to sign this contract. This serves as your digital signature.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={e => signingAs === 'household' ? setEmployerName(e.target.value) : setEmployeeName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all text-lg"
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
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Sign Contract
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ EMAIL CONTRACT MODAL ═══ */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0d0d15] rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/20 border border-purple-200/50 dark:border-purple-600/40 max-w-md w-full p-6 sm:p-8">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">Email Contract</h3>
              <p className="text-sm text-gray-600 dark:text-purple-200 mb-4">
                We'll send a copy of the signed contract to the email address below.
              </p>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={e => setEmailAddress(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all text-lg"
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
                  {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
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
