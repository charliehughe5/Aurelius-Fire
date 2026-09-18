import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Appointment, Premises } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { JobManagement } from './JobManagement';
import {
  Calendar as CalendarIcon,
  CalendarDays,
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
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  List,
} from 'lucide-react';

export const CalendarBookings: React.FC = () => {
  const { allClients, user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'calendar_grid' | 'cards_list' | 'jobs'>('calendar_grid');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [premisesList, setPremisesList] = useState<Premises[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Calendar Date Navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<{ date: string; items: Appointment[] } | null>(null);

  // Selected Appointment Inspection Modal
  const [inspectingAppointment, setInspectingAppointment] = useState<Appointment | null>(null);

  // Reschedule Modal
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:30');

  // Schedule New Appointment Modal (Admin Direct Booking)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [bookingClientId, setBookingClientId] = useState(allClients[0]?.id || '');
  const [bookingPremisesId, setBookingPremisesId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:30');
  const [bookingAssessor, setBookingAssessor] = useState(user?.name || 'Charlie Hughes');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  useEffect(() => {
    loadAppointments();
    api.getPremises().then(setPremisesList);
  }, []);

  useEffect(() => {
    if (!bookingClientId && allClients.length > 0) {
      setBookingClientId(allClients[0].id);
    }
  }, [allClients, bookingClientId]);

  const loadAppointments = async () => {
    const list = await api.getAppointments();
    setAppointments(list);
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.confirmAppointment(id, 'Confirmed by lead assessor. Escort briefing noted.');
      await loadAppointments();
      if (inspectingAppointment?.id === id) {
        setInspectingAppointment((prev) => (prev ? { ...prev, status: 'Confirmed' } : null));
      }
    } catch (err) {
      console.error('Failed to confirm appointment:', err);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.completeAppointment(id);
      await loadAppointments();
      if (inspectingAppointment?.id === id) {
        setInspectingAppointment((prev) => (prev ? { ...prev, status: 'Completed' } : null));
      }
    } catch (err) {
      console.error('Failed to complete appointment:', err);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelAppointment(id);
      await loadAppointments();
      if (inspectingAppointment?.id === id) {
        setInspectingAppointment((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
      }
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
      if (inspectingAppointment?.id === rescheduleTarget.id) {
        setInspectingAppointment((prev) =>
          prev ? { ...prev, appointmentDate: newDate, startTime: newTime, status: 'Confirmed' } : null
        );
      }
    } catch (err) {
      console.error('Failed to reschedule:', err);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingClientId || !bookingPremisesId || !bookingDate) {
      alert('Please select client, premises, and appointment date.');
      return;
    }

    setIsBookingSubmitting(true);
    try {
      await api.requestAppointment({
        clientId: bookingClientId,
        premisesId: bookingPremisesId,
        appointmentDate: bookingDate,
        startTime: bookingTime,
        clientNotes: bookingNotes,
      });

      setIsScheduleModalOpen(false);
      setBookingNotes('');
      await loadAppointments();
    } catch (err) {
      console.error('Failed to schedule assessment:', err);
      alert('Failed to schedule visit.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Month navigation helpers
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  // Compute grid days for current month (Monday-first)
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
  const startingDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0 for Mon, 6 for Sun
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: { dayNumber: number; dateString: string; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startingDayOffset - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const prevMonthDate = new Date(year, month - 1, d);
    daysArray.push({
      dayNumber: d,
      dateString: prevMonthDate.toISOString().split('T')[0],
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    // Format YYYY-MM-DD
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    daysArray.push({
      dayNumber: d,
      dateString: `${yyyy}-${mm}-${dd}`,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid (up to multiple of 7)
  const remainingCells = (7 - (daysArray.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    daysArray.push({
      dayNumber: d,
      dateString: nextMonthDate.toISOString().split('T')[0],
      isCurrentMonth: false,
    });
  }

  const todayString = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((app) => {
    if (filterStatus !== 'ALL' && app.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Site Calendar & Assessment Jobs Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage site attendance schedules, client booking requests, and full 11-stage assessment job lifecycles (Part 17 & 32)
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* Schedule button */}
          <button
            onClick={() => {
              setBookingDate(new Date().toISOString().split('T')[0]);
              setIsScheduleModalOpen(true);
            }}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Visit</span>
          </button>

          {/* SubTab Views */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('calendar_grid')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeSubTab === 'calendar_grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-700" />
              <span>Month Calendar</span>
            </button>
            <button
              onClick={() => setActiveSubTab('cards_list')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeSubTab === 'cards_list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-blue-700" />
              <span>Visits List</span>
            </button>
            <button
              onClick={() => setActiveSubTab('jobs')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeSubTab === 'jobs'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-700" />
              <span>Job Tracker</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'jobs' ? (
        <JobManagement />
      ) : activeSubTab === 'calendar_grid' ? (
        /* PART 32: INTERACTIVE MONTH CALENDAR GRID */
        <div className="space-y-4">
          {/* Month Navigation Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">{monthName}</h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition"
              >
                Today
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Table / Grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 text-center py-2.5">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-slate-400">Sat</span>
              <span className="text-slate-400">Sun</span>
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
              {daysArray.map((cell, idx) => {
                const dayAppointments = appointments.filter(
                  (a) => a.appointmentDate === cell.dateString && a.status !== 'Cancelled'
                );
                const isToday = cell.dateString === todayString;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (dayAppointments.length > 0) {
                        setSelectedDayAppointments({ date: cell.dateString, items: dayAppointments });
                      } else {
                        // Clicking an empty day opens quick schedule for that date
                        setBookingDate(cell.dateString);
                        setIsScheduleModalOpen(true);
                      }
                    }}
                    className={`min-h-[100px] p-2 transition cursor-pointer flex flex-col justify-between hover:bg-blue-50/40 ${
                      cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
                    }`}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday
                            ? 'bg-blue-700 text-white font-bold'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {dayAppointments.length > 0 && (
                        <span className="text-[10px] text-blue-700 font-bold">
                          {dayAppointments.length} {dayAppointments.length === 1 ? 'visit' : 'visits'}
                        </span>
                      )}
                    </div>

                    {/* Appointment Chips in Date Box */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayAppointments.slice(0, 2).map((app) => {
                        const isConfirmed = app.status === 'Confirmed';
                        const isCompleted = app.status === 'Completed';
                        return (
                          <div
                            key={app.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingAppointment(app);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center space-x-1 border ${
                              isConfirmed
                                ? 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                                : isCompleted
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                            }`}
                            title={`${app.startTime} - ${app.premisesName} (${app.clientName})`}
                          >
                            <span className="font-mono font-bold shrink-0">{app.startTime}</span>
                            <span className="truncate">{app.premisesName || app.clientName}</span>
                          </div>
                        );
                      })}
                      {dayAppointments.length > 2 && (
                        <div className="text-[9px] text-slate-500 font-semibold px-1">
                          +{dayAppointments.length - 2} more...
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] text-slate-300 group-hover:text-blue-600 transition">
                      + book
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* CARDS & AGENDA VIEW */
        <>
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
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
              title="No site visits found"
              description="There are currently no site assessment visits scheduled under this filter."
              icon={CalendarIcon}
              actionLabel="Schedule First Visit"
              onAction={() => setIsScheduleModalOpen(true)}
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
                        <CalendarIcon className="w-4 h-4 text-blue-700" />
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
                          Client Note: &quot;{app.clientNotes}&quot;
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
                        Site Visit Completed &bull; Ready for Report Delivery
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Day Visits Summary Drawer / Modal */}
      {selectedDayAppointments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Visits Scheduled for {new Date(selectedDayAppointments.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-xs text-slate-500">{selectedDayAppointments.items.length} site attendance appointments</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayAppointments(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {selectedDayAppointments.items.map((app) => (
                <div
                  key={app.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-700" />
                      <span>{app.startTime} - {app.endTime}</span>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{app.premisesName}</div>
                    <div className="text-[11px] text-slate-500">{app.clientName} &bull; Assessor: {app.assessorName}</div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedDayAppointments(null);
                        setInspectingAppointment(app);
                      }}
                      className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 border border-slate-300 rounded font-medium text-slate-700"
                    >
                      View & Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setBookingDate(selectedDayAppointments.date);
                  setSelectedDayAppointments(null);
                  setIsScheduleModalOpen(true);
                }}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Another Visit on this Day</span>
              </button>
              <button
                onClick={() => setSelectedDayAppointments(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspecting Appointment Modal */}
      {inspectingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-blue-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Site Assessment Visit</h3>
                  <p className="text-xs text-slate-500">Scheduled attendance record</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingAppointment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {inspectingAppointment.appointmentDate} @ {inspectingAppointment.startTime} - {inspectingAppointment.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <StatusBadge status={inspectingAppointment.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Premises:</span>
                  <span className="font-semibold text-slate-900">{inspectingAppointment.premisesName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client:</span>
                  <span className="text-slate-800">{inspectingAppointment.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assessor:</span>
                  <span className="text-slate-800">{inspectingAppointment.assessorName}</span>
                </div>
              </div>

              {inspectingAppointment.clientNotes && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Access / Client Instructions</label>
                  <p className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-700 italic">
                    &quot;{inspectingAppointment.clientNotes}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons in Inspection Modal */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              {inspectingAppointment.status === 'Requested' && (
                <>
                  <button
                    onClick={() => handleConfirm(inspectingAppointment.id)}
                    className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Visit</span>
                  </button>
                  <button
                    onClick={() => {
                      setRescheduleTarget(inspectingAppointment);
                      setNewDate(inspectingAppointment.appointmentDate);
                      setInspectingAppointment(null);
                    }}
                    className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-medium"
                  >
                    Reschedule
                  </button>
                </>
              )}

              {inspectingAppointment.status === 'Confirmed' && (
                <>
                  <button
                    onClick={() => handleComplete(inspectingAppointment.id)}
                    className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Survey Complete</span>
                  </button>
                  <button
                    onClick={() => {
                      setRescheduleTarget(inspectingAppointment);
                      setNewDate(inspectingAppointment.appointmentDate);
                      setInspectingAppointment(null);
                    }}
                    className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-medium"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancel(inspectingAppointment.id)}
                    className="p-2 border border-slate-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={() => setInspectingAppointment(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Assessment Modal (Direct Admin Booking) */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleScheduleSubmit}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Schedule Site Assessment Visit</h3>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
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
                  value={bookingClientId}
                  onChange={(e) => {
                    setBookingClientId(e.target.value);
                    setBookingPremisesId('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="">Select a client...</option>
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName || (c as any).name || 'Primary Contact'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Premises *</label>
                <select
                  required
                  value={bookingPremisesId}
                  onChange={(e) => setBookingPremisesId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="">Select premises to inspect...</option>
                  {premisesList
                    .filter((p) => !bookingClientId || p.clientId === bookingClientId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.premisesName || (p as any).name} — {p.addressLine1}, {p.postcode}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inspection Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time Slot *</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="09:00">09:00 AM (Early Slot)</option>
                    <option value="09:30">09:30 AM (Standard Morning)</option>
                    <option value="11:30">11:30 AM (Midday Slot)</option>
                    <option value="14:00">02:00 PM (Afternoon Slot)</option>
                    <option value="16:00">04:00 PM (Late Slot)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessor Name</label>
                <input
                  type="text"
                  value={bookingAssessor}
                  onChange={(e) => setBookingAssessor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Access Notes & Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Keyholder on site, parking in rear bay, escort needed for roof space"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBookingSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                {isBookingSubmitting ? 'Booking Visit...' : 'Confirm & Schedule Visit'}
              </button>
            </div>
          </form>
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
                  <option value="09:00">09:00 AM (Early Slot)</option>
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
