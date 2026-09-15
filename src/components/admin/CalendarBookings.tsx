import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Appointment } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  Building2,
  User,
  MapPin,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';

export const CalendarBookings: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Reschedule Modal
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:30');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const list = await api.getAppointments();
    setAppointments(list);
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.confirmAppointment(id, 'Confirmed by lead assessor. Escort briefing noted.');
      await loadAppointments();
    } catch (err) {
      console.error('Failed to confirm appointment:', err);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.completeAppointment(id);
      await loadAppointments();
    } catch (err) {
      console.error('Failed to complete appointment:', err);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelAppointment(id);
      await loadAppointments();
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !newDate) return;
    try {
      await api.rescheduleAppointment(rescheduleTarget.id, newDate, newTime);
      setRescheduleTarget(null);
      await loadAppointments();
    } catch (err) {
      console.error('Failed to reschedule:', err);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (filterStatus !== 'ALL' && app.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Site Assessment Calendar & Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage site attendance schedules, client booking requests, confirmation notices, and completed surveys
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        {['ALL', 'Requested', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Appointment Cards Grid */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          title="No upcoming appointments"
          description="There are currently no site assessment visits scheduled under this filter."
          icon={Calendar}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-900">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    <span>{app.appointmentDate}</span>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {app.startTime} - {app.endTime} (2 hrs allocated)
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <div className="font-semibold text-slate-900 flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.premisesName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{app.clientName}</div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Assessor: {app.assessorName}</span>
                  </div>
                  {app.clientNotes && (
                    <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-600 mt-2 italic">
                      Client Note: "{app.clientNotes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {app.status === 'Requested' && (
                  <>
                    <button
                      onClick={() => handleConfirm(app.id)}
                      className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Visit</span>
                    </button>
                    <button
                      onClick={() => {
                        setRescheduleTarget(app);
                        setNewDate(app.appointmentDate);
                      }}
                      className="p-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-600 text-xs"
                      title="Propose new slot"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </>
                )}

                {app.status === 'Confirmed' && (
                  <>
                    <button
                      onClick={() => handleComplete(app.id)}
                      className="flex-1 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Survey Complete</span>
                    </button>
                    <button
                      onClick={() => handleCancel(app.id)}
                      className="p-1.5 border border-slate-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg"
                      title="Cancel appointment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}

                {app.status === 'Completed' && (
                  <div className="w-full text-center py-1 bg-slate-50 text-emerald-700 font-medium text-xs rounded-md border border-slate-200">
                    Site Visit Completed • Ready for Report Delivery
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Reschedule Assessment Visit</h3>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Site: <span className="font-semibold">{rescheduleTarget.premisesName}</span>
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Date *</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slot Start Time</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="09:30">09:30 AM (Morning Slot)</option>
                  <option value="11:30">11:30 AM (Midday Slot)</option>
                  <option value="14:00">02:00 PM (Afternoon Slot)</option>
                  <option value="16:00">04:00 PM (Late Slot)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Save New Time
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
