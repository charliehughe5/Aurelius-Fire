import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Job, JobStatus, Client, Premises, User } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import {
  Briefcase,
  Calendar,
  Clock,
  User as UserIcon,
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  ClipboardList,
  Edit3,
  Trash2,
  X,
  Save,
} from 'lucide-react';

const ALL_STATUSES: JobStatus[] = [
  'New',
  'Booked',
  'Pre-assessment',
  'Ready for assessment',
  'Site assessment',
  'Draft report',
  'QA',
  'Issued',
  'Complete',
  'Review due',
  'Archived',
];

export const JobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [premisesList, setPremisesList] = useState<Premises[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form
  const [formData, setFormData] = useState({
    clientId: '',
    premisesId: '',
    assessorId: '',
    assessmentType: 'PAS 79-1:2020 Commercial Life Safety Fire Risk Assessment',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:30',
    status: 'Booked' as JobStatus,
    instructions: '',
    siteNotes: '',
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [jList, cList, pList, uList] = await Promise.all([
        api.getJobs(),
        api.getClients(false),
        api.getPremises(),
        api.getUsers().catch(() => []),
      ]);
      setJobs(jList.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()));
      setClients(cList);
      setPremisesList(pList);
      setUsers(uList);
    } catch (err) {
      console.error('Failed to load jobs data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.premisesId || !formData.appointmentDate) return;

    const assessor = users.find((u) => u.id === formData.assessorId);
    try {
      await api.createJob({
        ...formData,
        assessorName: assessor ? assessor.name : 'Charlie Hughes',
      });
      setIsCreateModalOpen(false);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to create job');
    }
  };

  const handleUpdateStatus = async (jobId: string, newStatus: JobStatus) => {
    try {
      await api.updateJob(jobId, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    } catch (err) {
      console.error('Failed to update job status:', err);
      await loadAll();
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job record?')) return;
    try {
      await api.deleteJob(id);
      await loadAll();
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (filterStatus !== 'ALL' && j.status !== filterStatus) return false;
    const matches = `${j.jobNumber} ${j.clientName || ''} ${j.premisesName || ''} ${j.assessorName || ''}`.toLowerCase();
    return matches.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Assessment Job Lifecycle Tracker</h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Part 17 Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Track and manage fire risk assessment jobs through all 11 lifecycle phases from initial booking to pre-assessment, site inspection, quality assurance, report issue, and annual review.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              clientId: clients[0]?.id || '',
              premisesId: premisesList[0]?.id || '',
              assessorId: users[0]?.id || '',
              assessmentType: 'PAS 79-1:2020 Commercial Life Safety Fire Risk Assessment',
              appointmentDate: new Date(Date.now() + 24 * 3600000).toISOString().split('T')[0],
              appointmentTime: '09:30',
              status: 'Booked',
              instructions: '',
              siteNotes: '',
            });
            setIsCreateModalOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assessment Job</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search job number, client, premises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({jobs.length})
          </button>
          {ALL_STATUSES.map((st) => {
            const count = jobs.filter((j) => j.status === st).length;
            if (count === 0 && st !== 'Booked' && st !== 'Site assessment' && st !== 'Issued') return null;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{st}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading jobs database...</div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            title="No assessment jobs found"
            description="No jobs match your selected filter criteria."
            icon={Briefcase}
            actionLabel="Create Assessment Job"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Job Number</th>
                  <th className="py-3 px-4">Client & Premises</th>
                  <th className="py-3 px-4">Appointment</th>
                  <th className="py-3 px-4">Assigned Assessor</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4 text-right">Update Phase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {job.jobNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{job.premisesName || 'Premises'}</div>
                      <div className="text-[11px] text-slate-500">{job.clientName || 'Client Organisation'}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-slate-900 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.appointmentDate}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{job.appointmentTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-slate-800">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{job.assessorName || 'Lead Assessor'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <select
                        value={job.status}
                        onChange={(e) => handleUpdateStatus(job.id, e.target.value as JobStatus)}
                        className="p-1 text-xs bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        title="Delete job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateJob}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create Assessment Job</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client Organisation *</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const prem = premisesList.find((p) => p.clientId === cId);
                    setFormData({
                      ...formData,
                      clientId: cId,
                      premisesId: prem ? prem.id : formData.premisesId,
                    });
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="">Select client organisation...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Premises to Assess *</label>
                <select
                  required
                  value={formData.premisesId}
                  onChange={(e) => setFormData({ ...formData, premisesId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="">Select premises...</option>
                  {premisesList
                    .filter((p) => !formData.clientId || p.clientId === formData.clientId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.premisesName} ({p.postcode})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Assessor</label>
                  <select
                    value={formData.assessorId}
                    onChange={(e) => setFormData({ ...formData, assessorId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="">Lead Assessor</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="New">New</option>
                    <option value="Booked">Booked</option>
                    <option value="Pre-assessment">Pre-assessment</option>
                    <option value="Ready for assessment">Ready for assessment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Site Attendance Instructions</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g. Report to David Miller at main entrance reception. High-vis vest required in basement storage."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Job</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
