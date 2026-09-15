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

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadClientId, setUploadClientId] = useState(allClients[0]?.id || '');
  const [uploadPremisesId, setUploadPremisesId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Fire Alarm Certificate (BS 5839)');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadDocuments();
    api.getPremises().then(setPremisesList);
  }, []);

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

  const handleArchive = async (id: string) => {
    try {
      await api.archiveDocument(id);
      await loadDocuments();
    } catch (err) {
      console.error('Failed to archive document:', err);
    }
  };

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.premisesName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
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
            Central repository for British Standard maintenance certificates, EICR electrical checks, and expiry warnings
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

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Current', 'Expiring soon', 'Expired'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterCompliance(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterCompliance === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
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
                  <th className="py-3 px-4">Document Title & Type</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Premises</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{doc.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{doc.category}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">{doc.clientName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{doc.premisesName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{doc.issueDate || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {doc.expiryDate || 'No expiry'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={doc.complianceStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition inline-flex items-center space-x-1"
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
                ))}
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
                  <option value="">Select client...</option>
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
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
                    .filter((p) => !uploadClientId || p.clientId === uploadClientId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.premisesName} ({p.postcode})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Fire Alarm Service Certificate 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category / Standard</label>
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
    </div>
  );
};
