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
  Check,
  X,
  Menu,
} from 'lucide-react';

export type PublicTabType = 'home' | 'quote' | 'about' | 'services' | 'coverage';

interface NavbarProps {
  onOpenPoliciesModal?: () => void;
  onOpenPolicy?: (key?: string) => void;
  publicTab?: PublicTabType;
  onSelectPublicTab?: (tab: PublicTabType) => void;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: PublicTabType) => {
    setPortalMode('PUBLIC');
    onSelectPublicTab?.(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="bg-slate-950 text-white relative z-40 border-b border-slate-800 transition-all shadow-md"
      style={{ backgroundColor: '#020617' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#020617' }}>
        <div className="flex items-center justify-between h-16" style={{ backgroundColor: '#020617' }}>
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0"
            onClick={() => handleTabClick('home')}
            style={{ backgroundColor: '#020617' }}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 shadow-md ring-2 ring-amber-400/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <div style={{ backgroundColor: '#020617' }}>
              <div className="flex items-center space-x-2">
                <span
                  className="font-bold text-base sm:text-lg tracking-tight text-white font-sans"
                  style={{ color: '#ffffff', backgroundColor: '#020617' }}
                >
                  AURELIUS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 font-semibold uppercase tracking-wider border border-slate-800 hidden sm:inline-block">
                  Commercial
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block font-light" style={{ color: '#cbd5e1' }}>
                Charlie Hughes • NEBOSH Fire Safety
              </p>
            </div>
          </div>

          {/* Center Apple-style Pill Navigation (Visible on Public Website) */}
          {portalMode === 'PUBLIC' && onSelectPublicTab && (
            <nav
              className="hidden lg:flex items-center space-x-1 p-1 rounded-full border border-slate-800 text-xs font-medium"
              style={{ backgroundColor: '#0f172a' }}
            >
              <button
                onClick={() => handleTabClick('home')}
                style={{
                  backgroundColor: publicTab === 'home' ? '#ffffff' : '#0f172a',
                  color: publicTab === 'home' ? '#020617' : '#f8fafc',
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                  publicTab === 'home'
                    ? 'font-bold shadow-xs'
                    : 'hover:text-amber-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabClick('coverage')}
                style={{
                  backgroundColor: publicTab === 'coverage' ? '#ffffff' : '#0f172a',
                  color: publicTab === 'coverage' ? '#020617' : '#f8fafc',
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center space-x-1.5 ${
                  publicTab === 'coverage'
                    ? 'font-bold shadow-xs'
                    : 'hover:text-amber-300'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span style={{ color: publicTab === 'coverage' ? '#020617' : '#f8fafc' }}>What We Cover</span>
              </button>
              <button
                onClick={() => handleTabClick('services')}
                style={{
                  backgroundColor: publicTab === 'services' ? '#ffffff' : '#0f172a',
                  color: publicTab === 'services' ? '#020617' : '#f8fafc',
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                  publicTab === 'services'
                    ? 'font-bold shadow-xs'
                    : 'hover:text-amber-300'
                }`}
              >
                Shops & Offices
              </button>
              <button
                onClick={() => handleTabClick('quote')}
                style={{
                  backgroundColor: publicTab === 'quote' ? '#f59e0b' : '#0f172a',
                  color: publicTab === 'quote' ? '#020617' : '#f8fafc',
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                  publicTab === 'quote'
                    ? 'font-bold shadow-xs'
                    : 'hover:text-amber-300'
                }`}
              >
                Instant Quote
              </button>
              <button
                onClick={() => handleTabClick('about')}
                style={{
                  backgroundColor: publicTab === 'about' ? '#ffffff' : '#0f172a',
                  color: publicTab === 'about' ? '#020617' : '#f8fafc',
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                  publicTab === 'about'
                    ? 'font-bold shadow-xs'
                    : 'hover:text-amber-300'
                }`}
              >
                About Charlie
              </button>
            </nav>
          )}

          {/* Right Action Tools & Portal Switcher */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0" style={{ backgroundColor: '#020617' }}>
            {/* Portal Mode Switcher Pills (Desktop & Tablet) */}
            <div
              className="hidden sm:flex items-center p-1 rounded-full border border-slate-700 text-xs font-medium"
              style={{ backgroundColor: '#0f172a' }}
            >
              <button
                onClick={() => {
                  setPortalMode('PUBLIC');
                  onSelectPublicTab?.('home');
                }}
                style={{
                  backgroundColor: portalMode === 'PUBLIC' ? '#ffffff' : '#0f172a',
                  color: portalMode === 'PUBLIC' ? '#020617' : '#f8fafc',
                }}
                className="px-2.5 sm:px-3 py-1 rounded-full flex items-center space-x-1.5 transition font-semibold"
                title="Public Commercial FRA Website"
                aria-label="Public Commercial Website View"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline" style={{ color: portalMode === 'PUBLIC' ? '#020617' : '#f8fafc' }}>Website</span>
              </button>
              <button
                onClick={() => {
                  const clientUser = allUsers.find((u) => u.role === 'CLIENT') || allUsers[0];
                  if (clientUser) switchUser(clientUser);
                  setPortalMode('CLIENT');
                }}
                style={{
                  backgroundColor: portalMode === 'CLIENT' ? '#10b981' : '#0f172a',
                  color: portalMode === 'CLIENT' ? '#020617' : '#f8fafc',
                }}
                className="px-2.5 sm:px-3 py-1 rounded-full flex items-center space-x-1.5 transition font-semibold"
                title="Client Self-Service Portal"
                aria-label="Client Self-Service Portal View"
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline" style={{ color: portalMode === 'CLIENT' ? '#020617' : '#f8fafc' }}>Client Portal</span>
              </button>
              <button
                onClick={() => {
                  const owner = allUsers.find((u) => u.role === 'OWNER') || allUsers[0];
                  if (owner) switchUser(owner);
                  setPortalMode('ADMIN');
                }}
                style={{
                  backgroundColor: portalMode === 'ADMIN' ? '#f59e0b' : '#0f172a',
                  color: portalMode === 'ADMIN' ? '#020617' : '#f8fafc',
                }}
                className="px-2.5 sm:px-3 py-1 rounded-full flex items-center space-x-1.5 transition font-semibold"
                title="Assessor & Operations CRM Hub"
                aria-label="Assessor Operations CRM Hub View"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline" style={{ color: portalMode === 'ADMIN' ? '#020617' : '#f8fafc' }}>Assessor CRM</span>
              </button>
            </div>

            {/* Legal Policies Button */}
            <button
              onClick={handleOpenPolicies}
              aria-label="Legal Policies & Terms"
              style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hidden xl:flex items-center space-x-1 transition active:scale-95 hover:text-amber-300"
            >
              <span style={{ color: '#f8fafc' }}>Legal Terms</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Notifications"
                aria-label="Toggle notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Notifications ({unreadCount} unread)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-amber-700 hover:underline flex items-center space-x-1 font-semibold"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 text-xs transition ${
                            n.isRead ? 'bg-white opacity-70' : 'bg-amber-50/40 font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            {!n.isRead && (
                              <button
                                onClick={() => markNotificationAsRead(n.id)}
                                className="text-[11px] text-amber-700 hover:underline shrink-0 ml-2"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
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

            {/* Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User Perspective Switcher"
                className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-full border border-white/10 transition text-left"
              >
                <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                  {currentUser?.name ? currentUser.name[0] : 'C'}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-800">Perspective Switcher</p>
                    <p className="text-[11px] text-slate-500">
                      Switch between Charlie Hughes (Assessor) and Client View
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
                      Assessor (Charlie Hughes)
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
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                            currentUser?.id === u.id
                              ? 'bg-amber-50 text-amber-900 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <div>{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.position || u.role}</div>
                          </div>
                          {currentUser?.id === u.id && (
                            <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                        </button>
                      ))}

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                      Client Organisation
                    </p>
                    {allClients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          selectClient(c);
                          setShowUserMenu(false);
                          setPortalMode('CLIENT');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                          currentClient?.id === c.id && portalMode === 'CLIENT'
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
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
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-white/10 space-y-1 animate-in slide-in-from-top-2">
            <button
              onClick={() => handleTabClick('home')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                publicTab === 'home' ? 'bg-white text-slate-950' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabClick('coverage')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                publicTab === 'coverage' ? 'bg-white text-slate-950' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
              <span>What We Cover (Ticks & Crosses)</span>
            </button>
            <button
              onClick={() => handleTabClick('services')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                publicTab === 'services' ? 'bg-white text-slate-950' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              Shops, Offices & Commercial
            </button>
            <button
              onClick={() => handleTabClick('quote')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                publicTab === 'quote' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              Instant Quote Calculator
            </button>
            <button
              onClick={() => handleTabClick('about')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                publicTab === 'about' ? 'bg-white text-slate-950' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              About Charlie Hughes
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenPolicies();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Legal Policies & Compliance
            </button>

            {/* Mobile Portal Mode Switcher */}
            <div className="pt-2 mt-2 border-t border-white/10">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Switch Portal Mode
              </div>
              <div className="grid grid-cols-3 gap-1.5 px-1">
                <button
                  onClick={() => {
                    setPortalMode('PUBLIC');
                    onSelectPublicTab?.('home');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 ${
                    portalMode === 'PUBLIC' ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-300'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Website</span>
                </button>
                <button
                  onClick={() => {
                    const clientUser = allUsers.find((u) => u.role === 'CLIENT') || allUsers[0];
                    if (clientUser) switchUser(clientUser);
                    setPortalMode('CLIENT');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 ${
                    portalMode === 'CLIENT' ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-300'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>Client</span>
                </button>
                <button
                  onClick={() => {
                    const owner = allUsers.find((u) => u.role === 'OWNER') || allUsers[0];
                    if (owner) switchUser(owner);
                    setPortalMode('ADMIN');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 ${
                    portalMode === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-300'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Assessor</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
