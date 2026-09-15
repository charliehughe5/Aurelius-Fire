import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Bell,
  CheckCircle2,
  ChevronDown,
  Building2,
  UserCheck,
  ExternalLink,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

interface NavbarProps {
  onOpenPoliciesModal?: () => void;
  onOpenPolicy?: (key?: string) => void;
  publicTab?: 'home' | 'quote' | 'about' | 'services';
  onSelectPublicTab?: (tab: 'home' | 'quote' | 'about' | 'services') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPoliciesModal,
  onOpenPolicy,
  publicTab = 'home',
  onSelectPublicTab,
}) => {
  const handleOpenPolicies = () => {
    if (onOpenPolicy) onOpenPolicy();
    else if (onOpenPoliciesModal) onOpenPoliciesModal();
  };
  const {
    currentUser,
    currentClient,
    allUsers,
    allClients,
    portalMode,
    unreadCount,
    notifications,
    setPortalMode,
    switchUser,
    selectClient,
    markNotificationAsRead,
    markAllAsRead,
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              setPortalMode('PUBLIC');
              onSelectPublicTab?.('home');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md ring-2 ring-amber-400/30">
              <ShieldAlert className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">AURELIUS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider border border-amber-500/30">
                  Commercial FRA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Commercial Fire Risk Assessments • Charlie Hughes
              </p>
            </div>
          </div>

          {/* Center Public Navigation (Visible when on Public Website) */}
          {portalMode === 'PUBLIC' && onSelectPublicTab && (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold">
              <button
                onClick={() => onSelectPublicTab('home')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  publicTab === 'home'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Commercial Services
              </button>
              <button
                onClick={() => onSelectPublicTab('quote')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  publicTab === 'quote'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Instant Quote
              </button>
              <button
                onClick={() => onSelectPublicTab('about')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  publicTab === 'about'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                About Charlie Hughes
              </button>
              <button
                onClick={() => onSelectPublicTab('services')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  publicTab === 'services'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Shops & Offices (No Sleeping)
              </button>
            </nav>
          )}

          {/* Portal Switcher Tabs */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              onClick={() => {
                setPortalMode('PUBLIC');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                portalMode === 'PUBLIC'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Public Commercial Website & Quote Engine"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Website</span>
            </button>
            <button
              onClick={() => {
                const clientUser = allUsers.find((u) => u.role === 'CLIENT') || allUsers[0];
                if (clientUser) switchUser(clientUser);
                setPortalMode('CLIENT');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                portalMode === 'CLIENT'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Client Self-Service Portal"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Client Portal</span>
            </button>
            <button
              onClick={() => {
                const owner = allUsers.find((u) => u.role === 'OWNER') || allUsers[0];
                if (owner) switchUser(owner);
                setPortalMode('ADMIN');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                portalMode === 'ADMIN'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Assessor & Operations CRM Hub"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Assessor CRM</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            {/* Legal Policies Button */}
            <button
              onClick={handleOpenPolicies}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md border border-slate-700 hidden md:flex items-center space-x-1 transition"
            >
              <span>Policies & Terms</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Notifications ({unreadCount} unread)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition ${
                            n.isRead ? 'bg-white opacity-70' : 'bg-blue-50/50 font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-slate-800">{n.title}</span>
                            {!n.isRead && (
                              <button
                                onClick={() => markNotificationAsRead(n.id)}
                                className="text-[11px] text-blue-600 hover:underline shrink-0 ml-2"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Persona / Role Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition text-left"
              >
                <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-200">
                  {currentUser?.name ? currentUser.name[0] : 'U'}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-medium text-white truncate max-w-[130px]">
                    {currentUser?.name || 'Sign In'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentUser?.role || 'Guest'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-800">Switch Active Perspective</p>
                    <p className="text-[11px] text-slate-500">
                      Test full workflow across assessor and client roles
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
                      Assessor / Internal Staff
                    </p>
                    {allUsers
                      .filter((u) => u.role !== 'CLIENT')
                      .map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between transition ${
                            currentUser?.id === u.id
                              ? 'bg-blue-50 text-blue-800 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <div>{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.position || u.role}</div>
                          </div>
                          {currentUser?.id === u.id && (
                            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </button>
                      ))}

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                      Client Organisation
                    </p>
                    {allClients.length === 0 ? (
                      <div className="px-2 py-1 text-xs text-slate-400 italic">
                        No clients registered yet
                      </div>
                    ) : (
                      allClients.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            selectClient(c);
                            setShowUserMenu(false);
                            setPortalMode('CLIENT');
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between transition ${
                            currentClient?.id === c.id && portalMode === 'CLIENT'
                              ? 'bg-emerald-50 text-emerald-800 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <div className="truncate">{c.companyName}</div>
                            <div className="text-[10px] text-slate-400">{c.contactName}</div>
                          </div>
                          {currentClient?.id === c.id && portalMode === 'CLIENT' && (
                            <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
