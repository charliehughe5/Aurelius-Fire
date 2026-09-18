import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { DocumentRecord, DocumentCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import {
  FileCheck,
  Search,
  Plus,
  Calendar,
  AlertTriangle,
  Upload,
  Download,
  Archive,
  X,
  FileText,
  History,
  GitCommit,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

const CATEGORIES: DocumentCategory[] = [
  'Fire Alarm Certificate (BS 5839)',
  'Emergency Lighting Certificate (BS 5266)',
  'Fire Extinguisher Service (BS 5306)',
  'Fixed Wire Electrical (EICR)',
  'Gas Safety Certificate',
  'Fire Door Inspection Report',
  'Lightning Protection Certificate',
  'Sprinkler Service Certificate',
  'Smoke Vent / AOV Maintenance',
  'Floor Plans & Spatial Drawings',
  'Evacuation Drill Record',
  'Other Statutory Record',
];

export const DocumentCompliance: React.FC = () => {
  const { allClients } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [premisesList, setPremisesList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompliance, setFilterCompliance] = useState<string>('ALL');

  // New Certificate Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadClientId, setUploadClientId] = useState(allClients[0]?.id || '');
  const [uploadPremisesId, setUploadPremisesId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Fire Alarm Certificate (BS 5839)');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Version Control Modal State (Part 21)
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [docForNewVersion, setDocForNewVersion] = useState<DocumentRecord | null>(null);
  const [versionIssueDate, setVersionIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [versionExpiryDate, setVersionExpiryDate] = useState('');
  const [versionChangeNotes, setVersionChangeNotes] = useState('');
  const [versionNotes, setVersionNotes] = useState('');
  const [isSubmittingVersion, setIsSubmittingVersion] = useState(false);

  // Version History Drawer / Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [docForHistory, setDocForHistory] = useState<DocumentRecord | null>(null);
  const [historyRecords, setHistoryRecords] = useState<DocumentRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    loadDocuments();
    api.getPremises().then(setPremisesList);
  }, []);

  useEffect(() => {
    if (!uploadClientId && allClients.length > 0) {
      setUploadClientId(allClients[0].id);
    }
  }, [allClients, uploadClientId]);

  const loadDocuments = async () => {
    const list = await api.getDocuments();
    setDocuments(list);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadClientId || !uploadPremisesId || !title) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      await api.uploadDocument({
        clientId: uploadClientId,
        premisesId: uploadPremisesId,
        title,
        category,
        fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileUrl: `/uploads/${Date.now()}_doc.pdf`,
        issueDate,
        expiryDate: expiryDate || undefined,
        notes,
      });

      setIsUploadModalOpen(false);
      setTitle('');
      setNotes('');
      await loadDocuments();
    } catch (err) {
      console.error('Failed to upload document:', err);
    }
  };

  const handleOpenNewVersionModal = (doc: DocumentRecord) => {
    setDocForNewVersion(doc);
    setVersionIssueDate(new Date().toISOString().split('T')[0]);
    if (doc.expiryDate) {
      const prev = new Date(doc.expiryDate);
      prev.setFullYear(prev.getFullYear() + 1);
      setVersionExpiryDate(prev.toISOString().split('T')[0]);
    } else {
      setVersionExpiryDate('');
    }
    setVersionChangeNotes(`Annual renewal / updated certification for ${doc.title || doc.name}`);
    setVersionNotes(doc.notes || '');
    setIsNewVersionModalOpen(true);
  };

  const handleNewVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForNewVersion) return;

    setIsSubmittingVersion(true);
    try {
      await api.uploadDocumentVersion(docForNewVersion.id, {
        fileUrl: `/uploads/renewal_${Date.now()}_v${(docForNewVersion.version || 1) + 1}.pdf`,
        fileName: `${(docForNewVersion.title || docForNewVersion.name || 'doc').toLowerCase().replace(/\s+/g, '_')}_v${(docForNewVersion.version || 1) + 1}.pdf`,
        issueDate: versionIssueDate,
        expiryDate: versionExpiryDate || undefined,
        versionNotes: versionChangeNotes,
        notes: versionNotes,
      });

      setIsNewVersionModalOpen(false);
      setDocForNewVersion(null);
      await loadDocuments();
    } catch (err) {
      console.error('Failed to upload new document version:', err);
      alert('Failed to save renewed version.');
    } finally {
      setIsSubmittingVersion(false);
    }
  };

  const handleOpenHistoryModal = async (doc: DocumentRecord) => {
    setDocForHistory(doc);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const history = await api.getDocumentHistory(doc.id);
      setHistoryRecords(history);
    } catch (err) {
      console.error('Failed to load document history:', err);
      setHistoryRecords([doc]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.archiveDocument(id);
      await loadDocuments();
    } catch (err) {
      console.error('Failed to archive document:', err);
    }
  };

  // Expiry counts for statutory oversight
  const expiredCount = documents.filter((d) => d.complianceStatus === 'Expired' && d.status !== 'Superseded').length;
  const expiringSoonCount = documents.filter(
    (d) => d.complianceStatus === 'Expiring soon' && d.status !== 'Superseded'
  ).length;

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      (d.title || d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.premisesName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterCompliance === 'ACTIVE') {
      return d.status !== 'Superseded';
    }
    if (filterCompliance === 'SUPERSEDED') {
      return d.status === 'Superseded';
    }
    if (filterCompliance !== 'ALL' && d.complianceStatus !== filterCompliance) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Document & Certificate Compliance Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central statutory repository for British Standard maintenance certificates, EICR electrical checks, and version lineage
          </p>
        </div>
        <button
          onClick={() => {
            setUploadClientId(allClients[0]?.id || '');
            setIsUploadModalOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 self-start"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Certificate</span>
        </button>
      </div>

      {/* Expiry Overview Banners */}
      {(expiredCount > 0 || expiringSoonCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {expiredCount > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-900">
                  {expiredCount} Expired {expiredCount === 1 ? 'Certificate' : 'Certificates'}
                </div>
                <p className="text-rose-700 mt-0.5">
                  Statutory testing is past its due date. Premises may be non-compliant under the Regulatory Reform (Fire Safety) Order 2005.
                </p>
              </div>
            </div>
          )}
          {expiringSoonCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900">
                  {expiringSoonCount} Expiring Soon (&lt; 30 Days)
                </div>
                <p className="text-amber-700 mt-0.5">
                  Maintenance checks due for renewal shortly. Upload renewed certification to maintain valid compliance.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search certificate title, premises, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Documents' },
            { id: 'ACTIVE', label: 'Active Only' },
            { id: 'Current', label: 'Current' },
            { id: 'Expiring soon', label: 'Expiring soon' },
            { id: 'Expired', label: 'Expired' },
            { id: 'SUPERSEDED', label: 'Superseded (History)' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterCompliance(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterCompliance === st.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredDocs.length === 0 ? (
          <EmptyState
            title="No documents found"
            description="No compliance certificates match the search or filter."
            icon={FileCheck}
            actionLabel="Upload First Certificate"
            onAction={() => setIsUploadModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Document Title & Version</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Client & Premises</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const isSuperseded = doc.status === 'Superseded';
                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSuperseded ? 'bg-slate-50/50 opacity-75' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <FileText className={`w-4 h-4 shrink-0 ${isSuperseded ? 'text-slate-400' : 'text-blue-700'}`} />
                          <span className="font-semibold text-slate-900">
                            {doc.title || doc.name}
                          </span>
                          <span
                            onClick={() => handleOpenHistoryModal(doc)}
                            className="cursor-pointer inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-800 transition"
                            title="Click to view full version history"
                          >
                            v{doc.version || 1}
                          </span>
                        </div>
                        {doc.versionNotes && (
                          <div className="text-[10px] text-slate-500 mt-0.5 italic flex items-center space-x-1">
                            <span>Note: {doc.versionNotes}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="inline-block max-w-[180px] truncate text-[11px]">
                          {doc.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{doc.clientName}</div>
                        <div className="text-[10px] text-slate-500">{doc.premisesName}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">{doc.issueDate || '—'}</td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {doc.expiryDate || 'No expiry'}
                      </td>

                      <td className="py-3.5 px-4">
                        {isSuperseded ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                            Superseded
                          </span>
                        ) : (
                          <StatusBadge status={doc.complianceStatus || doc.status} size="sm" />
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {/* New Version button (Part 21) */}
                        {!isSuperseded && (
                          <button
                            onClick={() => handleOpenNewVersionModal(doc)}
                            className="px-2 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-xs font-semibold border border-blue-200 transition inline-flex items-center space-x-1"
                            title="Upload renewed certificate / new version"
                          >
                            <Upload className="w-3 h-3" />
                            <span>New Version</span>
                          </button>
                        )}

                        {/* History button */}
                        <button
                          onClick={() => handleOpenHistoryModal(doc)}
                          className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition inline-flex items-center space-x-1"
                          title="View version lineage & history"
                        >
                          <History className="w-3 h-3 text-slate-500" />
                          <span>History</span>
                        </button>

                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition inline-flex items-center space-x-1"
                          title="Download document file"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>

                        <button
                          onClick={() => handleArchive(doc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Certificate Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload Compliance Certificate</h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client *</label>
                <select
                  required
                  value={uploadClientId}
                  onChange={(e) => {
                    setUploadClientId(e.target.value);
                    setUploadPremisesId('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="">Select a client...</option>
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Premises *</label>
                <select
                  required
                  value={uploadPremisesId}
                  onChange={(e) => setUploadPremisesId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="">Select premises...</option>
                  {premisesList
                    .filter((p) => p.clientId === uploadClientId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.addressLine1}, {p.postcode}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Fire Alarm Servicing Certificate 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Statutory Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inspection / Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry / Next Due Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Contractor</label>
                <input
                  type="text"
                  placeholder="e.g. Serviced by Chubb Fire & Security, no defects reported"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Upload & Register Certificate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upload New Version Modal (Part 21) */}
      {isNewVersionModalOpen && docForNewVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleNewVersionSubmit}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload New Document Version</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Creating Version {(docForNewVersion.version || 1) + 1} (superseding v{docForNewVersion.version || 1})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewVersionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-900">{docForNewVersion.title || docForNewVersion.name}</div>
              <div className="text-slate-600">Category: {docForNewVersion.category}</div>
              <div className="text-slate-600">Premises: {docForNewVersion.premisesName}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={versionIssueDate}
                    onChange={(e) => setVersionIssueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Expiry Date</label>
                  <input
                    type="date"
                    value={versionExpiryDate}
                    onChange={(e) => setVersionExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Revision / Renewal Notes *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual renewal - certificate issued with clean compliance result"
                  value={versionChangeNotes}
                  onChange={(e) => setVersionChangeNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contractor / Additional Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Inspected by British Fire Protection Ltd"
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-start space-x-2">
                <GitCommit className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p>
                  Uploading this will publish <strong>v{(docForNewVersion.version || 1) + 1}</strong> as the current active version.
                  Version {docForNewVersion.version || 1} will be archived as <em>Superseded</em> but will remain fully downloadable in the version history.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewVersionModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingVersion}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isSubmittingVersion ? 'Saving Version...' : `Publish Version ${(docForNewVersion.version || 1) + 1}`}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Version History Modal / Drawer (Part 21) */}
      {isHistoryModalOpen && docForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Document Version History</h3>
                  <p className="text-xs text-slate-500">
                    Complete statutory audit trail and revision lineage for this record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="font-semibold text-slate-900">{docForHistory.title || docForHistory.name}</div>
              <div className="text-slate-500 mt-0.5">
                {docForHistory.category} &bull; {docForHistory.premisesName} ({docForHistory.clientName})
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading version history...</div>
            ) : historyRecords.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No version history available.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {historyRecords.map((hist) => {
                  const isCurrent = hist.status !== 'Superseded' && !hist.isArchived;
                  return (
                    <div
                      key={hist.id}
                      className={`p-3.5 rounded-lg border text-xs transition ${
                        isCurrent
                          ? 'bg-blue-50/50 border-blue-200 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              isCurrent ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            v{hist.version || 1}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {hist.fileName || `${hist.title}_v${hist.version || 1}.pdf`}
                          </span>
                          {isCurrent ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              Active / Current
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-600">
                              Superseded
                            </span>
                          )}
                        </div>

                        <a
                          href={hist.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 text-slate-700 hover:bg-white bg-slate-100 rounded border border-slate-300 font-medium inline-flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download v{hist.version || 1}</span>
                        </a>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Uploaded On</span>
                          <span>{new Date(hist.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Issue Date</span>
                          <span>{hist.issueDate || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Expiry Date</span>
                          <span className="font-mono">{hist.expiryDate || 'No expiry'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Uploaded By</span>
                          <span>{hist.uploadedByName || 'Assessor / Admin'}</span>
                        </div>
                      </div>

                      {(hist.versionNotes || hist.notes) && (
                        <div className="mt-2 text-[11px] bg-white/70 p-2 rounded border border-slate-100 text-slate-700">
                          {hist.versionNotes && <div><strong>Change note:</strong> {hist.versionNotes}</div>}
                          {hist.notes && <div className="text-slate-500"><strong>Notes:</strong> {hist.notes}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
