import React from 'react';
import { ShieldCheck, Scale, FileText } from 'lucide-react';

interface FooterProps {
  onOpenPolicy: (key: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & UK Accreditation */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2 text-white font-semibold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>Aurelius Fire Safety</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Specialist UK commercial fire risk assessments for small shops, retail, offices, and commercial workspaces
              (non-sleeping). Founded and led by Charlie Hughes (NEBOSH Fire Safety).
            </p>
            <div className="text-[11px] text-slate-500 space-y-0.5">
              <div>Assessor: Charlie Hughes</div>
              <div>NEBOSH Fire Safety • PAS 79-1:2020</div>
              <div>Direct: charlie.a.s.hughes@gmail.com</div>
            </div>
          </div>

          {/* Col 2: Statutory Notice */}
          <div className="space-y-2 md:col-span-2 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-xs">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Statutory Legal Position</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Under the Regulatory Reform (Fire Safety) Order 2005 (in England and Wales), the Fire Safety (England)
              Regulations 2022, and the Fire (Scotland) Act 2005 (in Scotland), the nominated Responsible Person or
              Dutyholder retains ultimate legal responsibility for the premises' fire safety.
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Commissioning an independent fire risk assessor provides an expert technical evaluation to assist the
              Responsible Person, but does not transfer statutory legal duties or liability.
            </p>
          </div>

          {/* Col 3: Legal & Policies */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-xs flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Policies & Compliance</span>
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => onOpenPolicy('terms_and_conditions')}
                  className="hover:text-white transition text-left"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy_notice')}
                  className="hover:text-white transition text-left"
                >
                  UK GDPR & Privacy Notice
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('cancellation_policy')}
                  className="hover:text-white transition text-left"
                >
                  Cancellation & Rescheduling
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('complaints_procedure')}
                  className="hover:text-white transition text-left"
                >
                  Complaints Procedure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('document_retention')}
                  className="hover:text-white transition text-left"
                >
                  Document Retention Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Aurelius Fire Safety Ltd. All rights reserved. Founded by Charlie Hughes.</p>
          <p className="mt-2 sm:mt-0">PAS 79-1:2020 & NEBOSH Compliant Commercial Operations</p>
        </div>
      </div>
    </footer>
  );
};
