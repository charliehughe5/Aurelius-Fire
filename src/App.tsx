import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PoliciesModal } from './components/public/PoliciesModal';
import { PublicEnquiryQuote } from './components/public/PublicEnquiryQuote';
import { AboutCharlie } from './components/public/AboutCharlie';
import { CommercialServices } from './components/public/CommercialServices';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClientManagement } from './components/admin/ClientManagement';
import { PremisesManagement } from './components/admin/PremisesManagement';
import { QuotesManagement } from './components/admin/QuotesManagement';
import { InvoicesPayments } from './components/admin/InvoicesPayments';
import { CalendarBookings } from './components/admin/CalendarBookings';
import { DocumentCompliance } from './components/admin/DocumentCompliance';
import { FraDelivery } from './components/admin/FraDelivery';
import { ActionManagement } from './components/admin/ActionManagement';
import { PortfolioView } from './components/admin/PortfolioView';
import { BusinessReporting } from './components/admin/BusinessReporting';
import { AdminMessages } from './components/admin/AdminMessages';
import { AdminSettings } from './components/admin/AdminSettings';
import { ClientPortal } from './components/client/ClientPortal';
import {
  LayoutDashboard,
  Users,
  Building2,
  Layers,
  FileText,
  CreditCard,
  Calendar,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  Settings,
} from 'lucide-react';

const AdminAppContent: React.FC = () => {
  const { currentRole, setCurrentRole } = useAuth();
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [publicTab, setPublicTab] = useState<'home' | 'quote' | 'about' | 'services' | 'coverage'>('home');
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyModalKey, setPolicyModalKey] = useState<string | undefined>(undefined);

  const openPolicy = (key?: string) => {
    setPolicyModalKey(key);
    setPolicyModalOpen(true);
  };

  const navItems = [
    { id: 'dashboard', label: 'Operations', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'premises', label: 'Premises', icon: Building2 },
    { id: 'portfolio', label: 'Portfolio Matrix', icon: Layers },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'invoices', label: 'Invoices & Stripe', icon: CreditCard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'documents', label: 'Certificates', icon: FileCheck },
    { id: 'fras', label: 'FRA Delivery', icon: ShieldCheck },
    { id: 'actions', label: 'Action Plan', icon: ShieldAlert },
    { id: 'reporting', label: 'Reporting', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 selection:bg-amber-100 selection:text-amber-900">
      <Navbar
        onOpenPolicy={openPolicy}
        publicTab={publicTab}
        onSelectPublicTab={(tab) => {
          setPublicTab(tab);
          setCurrentRole('PUBLIC');
        }}
      />

      {/* Main Role-Based Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'PUBLIC' && (
          <>
            {(publicTab === 'home' || publicTab === 'quote') && (
              <PublicEnquiryQuote
                onViewClientPortal={() => setCurrentRole('CLIENT')}
                onOpenPolicy={openPolicy}
                onGoToAboutCharlie={() => setPublicTab('about')}
              />
            )}
            {publicTab === 'about' && (
              <AboutCharlie
                onGetQuoteClick={() => setPublicTab('quote')}
                onOpenPolicy={openPolicy}
              />
            )}
            {(publicTab === 'services' || publicTab === 'coverage') && (
              <CommercialServices
                onGetQuoteClick={() => setPublicTab('quote')}
                onOpenPolicy={openPolicy}
              />
            )}
          </>
        )}

        {currentRole === 'ADMIN' && (
          <div className="space-y-6">
            {/* Admin Subnav */}
            <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs overflow-x-auto flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin Tab View Routing */}
            {adminTab === 'dashboard' && (
              <AdminDashboard onNavigate={(tab) => setAdminTab(tab)} />
            )}
            {adminTab === 'clients' && <ClientManagement />}
            {adminTab === 'premises' && <PremisesManagement />}
            {adminTab === 'portfolio' && <PortfolioView />}
            {adminTab === 'quotes' && <QuotesManagement />}
            {adminTab === 'invoices' && <InvoicesPayments />}
            {adminTab === 'calendar' && <CalendarBookings />}
            {adminTab === 'documents' && <DocumentCompliance />}
            {adminTab === 'fras' && <FraDelivery />}
            {adminTab === 'actions' && <ActionManagement />}
            {adminTab === 'reporting' && <BusinessReporting />}
            {adminTab === 'messages' && <AdminMessages />}
            {adminTab === 'settings' && <AdminSettings />}
          </div>
        )}

        {currentRole === 'CLIENT' && <ClientPortal />}
      </main>

      <Footer onOpenPolicy={openPolicy} />

      <PoliciesModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        initialKey={policyModalKey}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AdminAppContent />
    </AuthProvider>
  );
}
