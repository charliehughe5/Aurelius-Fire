import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import {
  Building2,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const PortfolioView: React.FC = () => {
  const [matrix, setMatrix] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.getPortfolioReport();
      setMatrix(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatrix = matrix.filter((item) => {
    const s = searchTerm.toLowerCase();
    return (
      item.premises.premisesName.toLowerCase().includes(s) ||
      item.premises.addressLine1.toLowerCase().includes(s) ||
      item.premises.postcode.toLowerCase().includes(s) ||
      item.client?.companyName.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Multi-Premises Portfolio Matrix</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational status, compliance readiness, active certificates, and open actions across all managed premises
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search premises name, client, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
          />
        </div>
      </div>

      {/* Portfolio Matrix Grid */}
      {filteredMatrix.length === 0 ? (
        <EmptyState
          title="No premises in portfolio"
          description="No portfolio records match your search criteria."
          icon={Building2}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatrix.map(({ premises, client, latestFra, activeActionsCount, documentsCount }) => (
            <div
              key={premises.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>{premises.premisesName}</span>
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">{client?.companyName}</p>
                  </div>
                  <StatusBadge status={premises.status} size="sm" />
                </div>

                <div className="mt-2 text-slate-500 text-[11px] flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {premises.addressLine1}, {premises.city} {premises.postcode}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Type:</span>
                    <span className="font-medium text-slate-800 truncate block">{premises.premisesType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Readiness:</span>
                    <span
                      className={`font-semibold ${
                        premises.preAssessmentReadinessStatus === 'READY'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {premises.preAssessmentReadinessStatus || 'INFO REQUIRED'}
                    </span>
                  </div>
                </div>

                {/* Latest FRA Info */}
                <div className="mt-3 text-xs space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                    Fire Risk Assessment:
                  </span>
                  {latestFra ? (
                    <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded border border-blue-200/60">
                      <div>
                        <span className="font-semibold text-slate-800">{latestFra.reportNumber}</span>
                        <div className="text-[10px] text-slate-500">Review: {latestFra.recommendedReviewDate}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {latestFra.overallRiskRating} Risk
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-50 rounded text-slate-400 text-[11px] italic border border-slate-200/40">
                      No assessment delivered yet
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-1">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{documentsCount} Certs</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertTriangle
                    className={`w-3.5 h-3.5 ${
                      activeActionsCount > 0 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  />
                  <span className={activeActionsCount > 0 ? 'text-rose-700 font-bold' : ''}>
                    {activeActionsCount} Open Actions
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
