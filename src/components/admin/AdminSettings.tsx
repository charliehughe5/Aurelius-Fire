import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { BusinessSettings, LegalPolicy, PricingRule } from '../../types';
import { QuestionnaireSettings } from './QuestionnaireSettings';
import { TestDataManager } from './TestDataManager';
import { AuditAndEmailLogs } from './AuditAndEmailLogs';
import {
  Settings,
  ShieldAlert,
  Save,
  FileText,
  DollarSign,
  Percent,
  CheckCircle2,
  Building,
  CreditCard,
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Database,
  Activity,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [policies, setPolicies] = useState<LegalPolicy[]>([]);
  const [selectedPolicyKey, setSelectedPolicyKey] = useState<string>('terms_and_conditions');
  const [policyContent, setPolicyContent] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [isPolicySaved, setIsPolicySaved] = useState(false);

  // Settings Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'all' | 'profile' | 'stripe' | 'pricing' | 'policies' | 'questionnaire' | 'test_data' | 'logs'
  >('all');

  // Stripe Gateway Specific State
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isTestingStripe, setIsTestingStripe] = useState(false);
  const [isStripeSaved, setIsStripeSaved] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<{
    success: boolean;
    configured?: boolean;
    isSandbox?: boolean;
    livemode?: boolean;
    currency?: string;
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [s, pRules, pols] = await Promise.all([
        api.getSettings(),
        api.getPricingRules(),
        api.getPolicies(),
      ]);
      setSettings(s);
      setPricingRules(pRules);
      setPolicies(pols);

      const activePol = pols.find((p) => p.key === selectedPolicyKey) || pols[0];
      if (activePol) {
        setPolicyContent(activePol.content);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStripe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setIsStripeSaved(true);
      setTimeout(() => setIsStripeSaved(false), 3500);
    } catch (err) {
      console.error('Failed to save Stripe settings:', err);
    }
  };

  const handleTestStripe = async () => {
    if (!settings) return;
    setIsTestingStripe(true);
    setStripeTestResult(null);
    try {
      const res = await api.testStripeConnection({
        secretKey: settings.stripeSecretKey,
      });
      setStripeTestResult(res);
    } catch (err: any) {
      setStripeTestResult({
        success: false,
        error: err.message || 'Connection test failed. Please verify API key format.',
      });
    } finally {
      setIsTestingStripe(false);
    }
  };

  const handleClearStripeCredentials = async () => {
    if (!settings) return;
    if (
      window.confirm(
        'Are you sure you want to clear your Stripe credentials and revert to built-in Sandbox Simulation mode?'
      )
    ) {
      const cleared: BusinessSettings = {
        ...settings,
        stripeSecretKey: '',
        stripePublishableKey: '',
        stripeWebhookSecret: '',
        stripeAccountId: '',
        stripeMode: 'test',
      };
      const updated = await api.updateSettings(cleared);
      setSettings(updated);
      setStripeTestResult({
        success: true,
        configured: false,
        isSandbox: true,
        message: 'Stripe keys cleared. System safely running in built-in Sandbox Simulation mode.',
      });
    }
  };

  const handleCopyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/payments/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleSavePolicy = async () => {
    try {
      await api.updatePolicy(selectedPolicyKey, policyContent);
      setIsPolicySaved(true);
      setTimeout(() => setIsPolicySaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!settings) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  const isStripeConfigured = Boolean(settings.stripeSecretKey && settings.stripeSecretKey.trim().length > 0);
  const stripeMode = settings.stripeMode || 'test';

  return (
    <div className="space-y-8">
      {/* Header & Quick Navigation */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">System & Business Configuration</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assessor organisation profile, Stripe payment gateway credentials, pricing multipliers, and statutory policies
            </p>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                isStripeConfigured
                  ? stripeMode === 'live'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>
                {isStripeConfigured
                  ? stripeMode === 'live'
                    ? 'Stripe Live Mode'
                    : 'Stripe Test Mode'
                  : 'Stripe Sandbox (Details Pending)'}
              </span>
            </span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto mt-5 pt-1 text-xs font-medium">
          {[
            { id: 'all', label: 'All Configuration' },
            { id: 'profile', label: 'Assessor Profile' },
            {
              id: 'stripe',
              label: 'Stripe & Payment Gateway',
              badge: isStripeConfigured ? (stripeMode === 'live' ? 'Live' : 'Test') : 'Pending',
            },
            { id: 'pricing', label: 'Pricing Multipliers' },
            { id: 'policies', label: 'Legal Policies' },
            { id: 'questionnaire', label: 'Questionnaire (Part 18)' },
            { id: 'test_data', label: 'Test Data Engine (Part 45)' },
            { id: 'logs', label: 'Audit & Email Logs (Parts 33/34)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    activeTab === tab.id
                      ? 'bg-slate-700 text-slate-100'
                      : tab.badge === 'Live'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tab.badge === 'Test'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: STRIPE & PAYMENT GATEWAY (Highlighted or displayed when active) */}
      {(activeTab === 'all' || activeTab === 'stripe') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Section Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  Stripe Payment Gateway Configuration
                </h2>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Configure your Stripe API credentials to securely accept online card payments for quotes, deposits, and VAT compliance invoices.
              </p>
            </div>

            {/* Current Gateway Status Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {isStripeConfigured ? (
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 ${
                    stripeMode === 'live'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Stripe Connected ({stripeMode === 'live' ? 'Live Mode' : 'Test Mode'})</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Sandbox Active (Add Details Later)</span>
                </div>
              )}
            </div>
          </div>

          {/* Educational / Status Banner */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p>
                <strong className="text-slate-800">Add Stripe Details Later Friendly:</strong> You are free to enter your Stripe keys at any time. If you do not have your keys right now, Aurelius Commercial Fire Safety automatically runs on the integrated <strong>Sandbox Payment Simulator</strong>. Clients can accept quotes and submit card payments in simulation mode with instant invoice mark-paid and receipt workflows.
              </p>
            </div>
          </div>

          {/* Stripe Configuration Form */}
          <form onSubmit={handleSaveStripe} className="p-6 space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Stripe Environment Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                <label
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition ${
                    settings.stripeMode !== 'live'
                      ? 'bg-blue-50/70 border-blue-500/40 text-blue-950 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="stripeMode"
                    value="test"
                    checked={settings.stripeMode !== 'live'}
                    onChange={() => setSettings({ ...settings, stripeMode: 'test' })}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold">Test Mode (Recommended)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Process simulated test cards (e.g. 4242 4242...) using test keys (<code className="font-mono text-slate-700">pk_test_...</code> / <code className="font-mono text-slate-700">sk_test_...</code>).
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition ${
                    settings.stripeMode === 'live'
                      ? 'bg-emerald-50/70 border-emerald-500/40 text-emerald-950 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="stripeMode"
                    value="live"
                    checked={settings.stripeMode === 'live'}
                    onChange={() => setSettings({ ...settings, stripeMode: 'live' })}
                    className="mt-1 text-emerald-600"
                  />
                  <div>
                    <div className="text-xs font-bold">Live Production Mode</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Accept genuine customer credit/debit card transactions using live keys (<code className="font-mono text-slate-700">pk_live_...</code> / <code className="font-mono text-slate-700">sk_live_...</code>).
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Credentials Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
              {/* Publishable Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Stripe Publishable Key</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Client-Side Tokenization</span>
                </div>
                <input
                  type="text"
                  placeholder={settings.stripeMode === 'live' ? 'pk_live_...' : 'pk_test_...'}
                  value={settings.stripePublishableKey || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, stripePublishableKey: e.target.value.trim() })
                  }
                  className="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <p className="text-[11px] text-slate-500">
                  Starts with <code className="font-mono">pk_test_</code> or <code className="font-mono">pk_live_</code>. Safely used by frontend card payment widgets.
                </p>
              </div>

              {/* Secret Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Stripe Secret Key</span>
                  </label>
                  <span className="text-[10px] text-rose-600 font-medium">Server-Only Secret</span>
                </div>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    placeholder={settings.stripeMode === 'live' ? 'sk_live_...' : 'sk_test_...'}
                    value={settings.stripeSecretKey || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, stripeSecretKey: e.target.value.trim() })
                    }
                    className="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 pr-10 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showSecretKey ? 'Hide key' : 'Reveal key'}
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Starts with <code className="font-mono">sk_test_</code> or <code className="font-mono">sk_live_</code>. Kept strictly on the backend server for PaymentIntents and refunds.
                </p>
              </div>

              {/* Webhook Secret */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Webhook Signing Secret (Optional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Event Signature Verification</span>
                </div>
                <div className="relative">
                  <input
                    type={showWebhookSecret ? 'text' : 'password'}
                    placeholder="whsec_..."
                    value={settings.stripeWebhookSecret || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, stripeWebhookSecret: e.target.value.trim() })
                    }
                    className="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 pr-10 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Verifies incoming automated webhooks when customer checkout finishes.
                </p>
              </div>

              {/* Statement Descriptor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Statement Descriptor</label>
                  <span className="text-[10px] text-slate-400">Max 22 Characters</span>
                </div>
                <input
                  type="text"
                  maxLength={22}
                  placeholder="AURELIUS FIRE"
                  value={settings.stripeStatementDescriptor || 'AURELIUS FIRE'}
                  onChange={(e) =>
                    setSettings({ ...settings, stripeStatementDescriptor: e.target.value })
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent uppercase"
                />
                <p className="text-[11px] text-slate-500">
                  Business name as it appears on your client's bank and credit card statements.
                </p>
              </div>

              {/* Connected Account ID */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800">
                  Stripe Connected Merchant ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="acct_..."
                  value={settings.stripeAccountId || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, stripeAccountId: e.target.value.trim() })
                  }
                  className="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <p className="text-[11px] text-slate-500">
                  If using Stripe Connect or routing payouts to a secondary company entity.
                </p>
              </div>

              {/* Currency & Automatic Receipts */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Settlement Currency</label>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800">
                      GBP (£) - British Pound Sterling
                    </span>
                    <span className="text-[11px] text-slate-500">UK Compliance Standard</span>
                  </div>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={settings.stripeAutoReceipts ?? true}
                    onChange={(e) =>
                      setSettings({ ...settings, stripeAutoReceipts: e.target.checked })
                    }
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Send automated Stripe-hosted payment receipt emails to clients upon card capture
                  </span>
                </label>
              </div>
            </div>

            {/* Webhook Endpoint Copy Box */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-800">Stripe Webhook Endpoint URL:</span>
                <div className="font-mono text-[11px] text-slate-600 mt-0.5 break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/api/payments/webhook` : '/api/payments/webhook'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyWebhookUrl}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium flex items-center space-x-1.5 shrink-0 transition"
              >
                {copiedWebhook ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied URL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Webhook URL</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Connection Banner (Feedback) */}
            {stripeTestResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start space-x-3 ${
                  stripeTestResult.success
                    ? stripeTestResult.configured
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {stripeTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-bold">
                    {stripeTestResult.success
                      ? stripeTestResult.configured
                        ? 'Stripe Connection Verified'
                        : 'Sandbox Mode Active'
                      : 'Connection Verification Failed'}
                  </div>
                  <p>{stripeTestResult.message || stripeTestResult.error}</p>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleTestStripe}
                  disabled={isTestingStripe}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingStripe ? 'animate-spin' : ''}`} />
                  <span>{isTestingStripe ? 'Verifying...' : 'Test Stripe Connection'}</span>
                </button>

                {isStripeConfigured && (
                  <button
                    type="button"
                    onClick={handleClearStripeCredentials}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition"
                  >
                    Clear Keys & Revert to Sandbox
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {isStripeSaved && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Stripe Settings Saved</span>
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Stripe Configuration</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Helper Guides (Collapsible or visible) */}
          <div className="border-t border-slate-200 bg-slate-50/70 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Guide: Finding API Keys */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>How to find your Stripe API Keys</span>
                </span>
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center space-x-0.5 text-[11px]"
                >
                  <span>Stripe Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                1. Sign in to your Stripe account at <code className="font-mono">dashboard.stripe.com</code>.<br />
                2. Navigate to <strong>Developers &gt; API keys</strong>.<br />
                3. Copy your <strong>Publishable key</strong> and reveal your <strong>Secret key</strong>.<br />
                4. For live card processing, toggle off "Test mode" in the top bar of Stripe and copy the live keys.
              </p>
            </div>

            {/* Guide: Standard Test Card Numbers */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Stripe Test Card Numbers</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600 font-mono">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-sans text-slate-500">Successful Payment:</span>
                  <span className="font-bold text-slate-800">4242 • 4242 • 4242 • 4242</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-sans text-slate-500">3D Secure (SCA):</span>
                  <span className="font-bold text-slate-800">4000 • 0027 • 6000 • 3184</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-500">Card Expiry & CVC:</span>
                  <span className="text-slate-700 font-sans">Any future date • Any 3 digits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2 & 3: BUSINESS PROFILE & PRICING CONFIGURATION */}
      {(activeTab === 'all' || activeTab === 'profile' || activeTab === 'pricing') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Profile Form */}
          {(activeTab === 'all' || activeTab === 'profile') && (
            <form
              onSubmit={handleSaveSettings}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                  <Building className="w-4 h-4 text-blue-700" />
                  <span>Assessor Organisation Profile</span>
                </h2>
                {isSaved && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </span>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Trading Name</label>
                  <input
                    type="text"
                    value={settings.companyName || settings.tradingName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        companyName: e.target.value,
                        tradingName: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company Reg Number</label>
                    <input
                      type="text"
                      value={settings.companyNumber}
                      onChange={(e) => setSettings({ ...settings, companyNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      VAT Registration No <span className="text-[10px] font-normal text-emerald-600">(Zero VAT / Exempt)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Not VAT Registered (Zero VAT)"
                      value={settings.vatNumber}
                      onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Telephone</label>
                    <input
                      type="text"
                      value={settings.telephone}
                      onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registered Address</label>
                  <textarea
                    rows={2}
                    value={settings.registeredAddress || settings.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        registeredAddress: e.target.value,
                        address: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Base Assessment Fee (£)</label>
                    <input
                      type="number"
                      value={settings.baseAssessmentFee || 350}
                      onChange={(e) =>
                        setSettings({ ...settings, baseAssessmentFee: Number(e.target.value) })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UK VAT Rate (%)</label>
                    <input
                      type="number"
                      value={settings.vatPercentage || settings.vatRatePercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          vatPercentage: Number(e.target.value),
                          vatRatePercent: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Standard Statutory Statement on Quotations
                  </label>
                  <textarea
                    rows={3}
                    value={settings.statutoryStatement}
                    onChange={(e) =>
                      setSettings({ ...settings, statutoryStatement: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Business Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* Pricing Rules Engine Table */}
          {(activeTab === 'all' || activeTab === 'pricing') && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>Active Pricing Multipliers & Surcharges</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Rules automatically calculated on customer enquiry forms and formal quotations
                </p>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {pricingRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{rule.ruleName}</span>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {rule.ruleType} • Multiplier: {rule.multiplier}x
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">
                        +£{rule.additionalFee.toFixed(2)}
                      </span>
                      <div className="text-[10px]">
                        <span
                          className={`font-semibold ${
                            rule.isActive ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: STATUTORY LEGAL POLICIES EDITOR */}
      {(activeTab === 'all' || activeTab === 'policies') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-700" />
                <span>Legal Policy Documents & Notice Editor</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Edit the live wording displayed to clients on quotes, contracts, and footer disclosures
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isPolicySaved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Policy Updated</span>
                </span>
              )}
              <button
                onClick={handleSavePolicy}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Publish Policy Changes</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Policy Selector */}
            <div className="w-full md:w-64 space-y-1">
              {policies.map((pol) => (
                <button
                  key={pol.key}
                  onClick={() => {
                    setSelectedPolicyKey(pol.key);
                    setPolicyContent(pol.content);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                    selectedPolicyKey === pol.key
                      ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pol.title}
                </button>
              ))}
            </div>

            {/* Text Editor */}
            <div className="flex-1">
              <textarea
                rows={12}
                value={policyContent}
                onChange={(e) => setPolicyContent(e.target.value)}
                className="w-full font-sans text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pre-Assessment Questionnaire Configurator */}
      {(activeTab === 'all' || activeTab === 'questionnaire') && (
        <div className="pt-4">
          <QuestionnaireSettings />
        </div>
      )}

      {/* Test Data Engine */}
      {(activeTab === 'all' || activeTab === 'test_data') && (
        <div className="pt-4">
          <TestDataManager />
        </div>
      )}

      {/* Audit Trail & Email Transmission Logs */}
      {(activeTab === 'all' || activeTab === 'logs') && (
        <div className="pt-4">
          <AuditAndEmailLogs />
        </div>
      )}
    </div>
  );
};
