import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  Building2,
  FileText,
  CreditCard,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to load dashboard report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !report) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        Loading operational analytics...
      </div>
    );
  }

  const stats = {
    totalClients: report?.stats?.totalClients ?? report?.totalClients ?? 0,
    totalPremises: report?.stats?.totalPremises ?? report?.totalPremises ?? 0,
    activeQuotes: report?.stats?.activeQuotes ?? report?.quotesAwaitingResponse ?? 0,
    paidRevenue: report?.stats?.paidRevenue ?? report?.paymentsReceivedTotal ?? 0,
    pendingInvoicesAmount: report?.stats?.pendingInvoicesAmount ?? report?.outstandingInvoicesTotal ?? 0,
    openActions: report?.stats?.openActions ?? report?.overdueActionsCount ?? 0,
    overdueActions: report?.stats?.overdueActions ?? report?.overdueActionsCount ?? 0,
  };
  const recentEnquiries = report?.recentEnquiries || [];
  const pendingQuotes = report?.pendingQuotes || [];
  const upcomingAppointments = report?.upcomingAppointments || [];
  const highPriorityActions = report?.highPriorityActions || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assessor Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time UK fire risk assessment operations, pipeline, bookings and compliance actions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('quotes')}
            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1"
          >
            <span>+ Create Quote</span>
          </button>
          <button
            onClick={() => onNavigate('fras')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1"
          >
            <span>Deliver FRA Report</span>
          </button>
        </div>
      </div>

      {/* GUIDED WORKFLOW: 5 STEPS TO MANAGE ASSESSMENTS */}
      <div className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[11px] uppercase tracking-wider">
                Assessor Guided Flow
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-600 text-xs font-medium">Recommended Workflow in 5 Simple Steps</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1">
              Start Here: How to Manage Clients & Fire Risk Assessments in FireVault
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Click any step below to jump directly into that operation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Step 1: Add Client */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-blue-400 hover:bg-blue-50/30 transition">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                <span>STEP 1</span>
                {stats.totalClients > 0 ? (
                  <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                    {stats.totalClients} Registered
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                    Action Needed
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 text-xs">Add Client Organisation</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Record the customer company and their designated Responsible Person contact.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('clients')}
              className="w-full py-1.5 px-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>1. Add Client</span>
            </button>
          </div>

          {/* Step 2: Add Premises */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-blue-400 hover:bg-blue-50/30 transition">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                <span>STEP 2</span>
                <span className="text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                  {stats.totalPremises} Sites
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs">Add Premises / Sites</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Register property addresses, floor area, storeys, occupancy & sleeping risks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('premises')}
              className="w-full py-1.5 px-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>2. Add Premises</span>
            </button>
          </div>

          {/* Step 3: Issue Quote */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-blue-400 hover:bg-blue-50/30 transition">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                <span>STEP 3</span>
                <span className="text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                  {stats.activeQuotes} Quotes
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs">Issue Assessment Quote</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Price the inspection according to risk scale and email formal fee proposal.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('quotes')}
              className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. Create Quote</span>
            </button>
          </div>

          {/* Step 4: Deliver FRA */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-blue-400 hover:bg-blue-50/30 transition">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                <span>STEP 4</span>
                <span className="text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                  PAS 79
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs">Conduct & Deliver FRA</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Perform site survey, log hazards, calculate matrix risk and issue statutory PDF.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('fras')}
              className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. Deliver FRA</span>
            </button>
          </div>

          {/* Step 5: Remedial Actions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-blue-400 hover:bg-blue-50/30 transition">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                <span>STEP 5</span>
                <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${stats.openActions > 0 ? 'text-rose-700 bg-rose-100' : 'text-emerald-700 bg-emerald-100'}`}>
                  {stats.openActions > 0 ? `${stats.openActions} Pending` : 'All Clear'}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs">Verify Remedial Actions</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Review dutyholder repair photos and certify statutory compliance sign-off.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('actions')}
              className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>5. Sign Off Actions</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Clients</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalClients}</div>
          <div className="text-[10px] text-slate-400 mt-1">Active commercial & residential</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Premises</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalPremises}</div>
          <div className="text-[10px] text-slate-400 mt-1">Properties in database</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Active Quotes</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{stats.activeQuotes}</div>
          <div className="text-[10px] text-slate-400 mt-1">Pending acceptance or payment</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Paid Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">£{stats.paidRevenue.toFixed(0)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Total completed payments</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Pending Invoices</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">£{stats.pendingInvoicesAmount.toFixed(0)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting client payment</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Open Actions</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{stats.openActions}</div>
          <div className="text-[10px] text-rose-600 mt-1">{stats.overdueActions} overdue for review</div>
        </div>
      </div>

      {/* 2-Column Split: Enquiries/Quotes & Appointments/Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Pending Public Enquiries */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Incoming Enquiries ({recentEnquiries.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('clients')}
              className="text-xs text-blue-700 hover:underline font-medium"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentEnquiries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No pending enquiries</div>
            ) : (
              recentEnquiries.map((enq: any) => (
                <div key={enq.id} className="p-4 hover:bg-slate-50 transition text-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">{enq.company}</span>
                      <StatusBadge status={enq.status} size="sm" />
                    </div>
                    <p className="text-slate-500">{enq.premisesAddress}</p>
                    <p className="text-[11px] text-slate-400">
                      Contact: {enq.name} ({enq.email}) • Type: {enq.premisesType}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="font-bold text-slate-900">
                      £{enq.indicativePrice ? enq.indicativePrice.toFixed(2) : '0.00'}
                    </div>
                    <button
                      onClick={() => onNavigate('quotes')}
                      className="mt-1 px-2.5 py-1 bg-slate-900 text-white rounded-md text-[11px] hover:bg-slate-800 transition"
                    >
                      Process Quote
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Urgent Fire Safety Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                High Priority Fire Safety Actions
              </h2>
            </div>
            <button
              onClick={() => onNavigate('actions')}
              className="text-xs text-rose-700 hover:underline font-medium"
            >
              Action Hub
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {highPriorityActions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No high risk fire safety actions outstanding. All clear!
              </div>
            ) : (
              highPriorityActions.map((act: any) => (
                <div key={act.id} className="p-4 hover:bg-slate-50 transition text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-semibold text-slate-700">{act.actionReference}</span>
                      <StatusBadge status={act.riskRating} size="sm" />
                      <StatusBadge status={act.status} size="sm" />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Due: {act.targetCompletionDate || 'ASAP'}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800">{act.deficiencyFound}</p>
                  <p className="text-slate-500 text-[11px]">{act.recommendedAction}</p>
                  <div className="flex justify-between items-center pt-1 text-[11px]">
                    <span className="text-slate-400">{act.category}</span>
                    <button
                      onClick={() => onNavigate('actions')}
                      className="text-blue-700 hover:underline font-medium"
                    >
                      Review evidence & close →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Appointments & Quotes Awaiting Acceptance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Upcoming Site Assessments
              </h2>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs text-blue-700 hover:underline font-medium"
            >
              Calendar
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingAppointments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No upcoming appointments</div>
            ) : (
              upcomingAppointments.map((app: any) => (
                <div key={app.id} className="p-4 hover:bg-slate-50 transition text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {app.appointmentDate} at {app.startTime} - {app.endTime}
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">Assessor: {app.assessorName}</p>
                    <div className="mt-1">
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('calendar')}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-[11px] transition"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quotes Pending */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Pending Quotations Pipeline
              </h2>
            </div>
            <button
              onClick={() => onNavigate('quotes')}
              className="text-xs text-blue-700 hover:underline font-medium"
            >
              Manage Quotes
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingQuotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No pending quotes</div>
            ) : (
              pendingQuotes.map((q: any) => (
                <div key={q.id} className="p-4 hover:bg-slate-50 transition text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">{q.quoteNumber}</span>
                      <StatusBadge status={q.status} size="sm" />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Valid until: {q.validUntil}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      £{q.totalAmount?.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onNavigate('quotes')}
                      className="text-blue-700 hover:underline text-[11px]"
                    >
                      Open Quote →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
