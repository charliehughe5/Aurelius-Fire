import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { AuditLogRecord, EmailLogRecord } from '../../types';
import {
  ShieldAlert,
  Mail,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Eye,
  X,
} from 'lucide-react';

export const AuditAndEmailLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'emails'>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmailLog, setSelectedEmailLog] = useState<EmailLogRecord | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [audits, emails] = await Promise.all([
        api.getAuditLogs(),
        api.getEmailLogs().catch(() => []),
      ]);
      setAuditLogs(audits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setEmailLogs(emails.sort((a, b) => new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAudits = auditLogs.filter((l) => {
    const text = `${l.action} ${l.userName} ${l.userRole} ${l.targetEntityType} ${l.targetEntityId || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const filteredEmails = emailLogs.filter((m) => {
    const text = `${m.recipientEmail} ${m.subject} ${m.template} ${m.status}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Statutory Audit Trail & Email Transmission Log</h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Parts 33 & 34
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Immutable log of all user security actions, quote conversions, report distributions, and outbound email notifications.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 self-start sm:self-auto"
          title="Refresh logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'emails'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Transmission Log ({emailLogs.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, email, actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white outline-hidden"
          />
        </div>
      </div>

      {/* Content View */}
      {activeTab === 'audit' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {filteredAudits.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No audit records match your query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User / Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredAudits.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString('en-GB')}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{item.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.userRole}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {item.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">
                        <span className="font-medium">{item.targetEntityType}</span>
                        {item.targetEntityId && (
                          <span className="text-slate-400 text-[10px] ml-1 font-mono">({item.targetEntityId})</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {item.metadata ? JSON.stringify(item.metadata) : item.newState ? 'State modified' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No email records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Sent At</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Template</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmails.map((mail) => (
                    <tr key={mail.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(mail.sentAt || mail.createdAt).toLocaleString('en-GB')}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {mail.recipientEmail}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 max-w-sm truncate">
                        {mail.subject}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-mono">
                          {mail.template}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {mail.status === 'sent' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sent</span>
                          </span>
                        ) : mail.status === 'queued' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Queued
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedEmailLog(mail)}
                          className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Email Transmission Detail Modal */}
      {selectedEmailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 my-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Email Transmission Record
                </h3>
                <p className="text-xs text-slate-500">
                  ID: <span className="font-mono">{selectedEmailLog.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmailLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Recipient</span>
                  <span className="font-semibold text-slate-800">{selectedEmailLog.recipientEmail}</span>
                  {selectedEmailLog.recipientName && (
                    <span className="text-slate-500 text-[11px] block">({selectedEmailLog.recipientName})</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Sent At</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedEmailLog.sentAt || selectedEmailLog.createdAt).toLocaleString('en-GB')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Template Type</span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                    {selectedEmailLog.template}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Status</span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedEmailLog.status === 'sent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedEmailLog.status === 'queued'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedEmailLog.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] font-bold block mb-1">Subject Line</span>
                <div className="p-2.5 bg-slate-100 font-semibold text-slate-900 rounded-lg text-xs border border-slate-200">
                  {selectedEmailLog.subject}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] font-bold block mb-1">Email Body Content</span>
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-72 overflow-y-auto shadow-inner">
                  {selectedEmailLog.body || '(No body text recorded)'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedEmailLog(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
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
