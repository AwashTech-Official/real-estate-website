import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getAdminLeads, updateLeadStatus } from '../lib/supabase';
import type { LeadRecord } from '../types/database';

export const LeadsModule: React.FC = () => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    const data = await getAdminLeads();
    setLeads(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, status: string) => {
    const res = await updateLeadStatus(leadId, status);
    if (res.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status } : l))
      );
      setFeedback('Lead status updated.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const statusOptions = ['new', 'contacted', 'qualified', 'nurturing', 'converted', 'closed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F3EF] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C8A35F]" />
            <span>Prospective Client Leads</span>
          </h2>
          <p className="text-xs text-[#B4B1A8] mt-0.5">
            Track prospective property buyers, sellers, and valuation leads.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLeads}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#141519]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#0C0D10]/50 font-mono text-[11px] uppercase tracking-wider text-[#B4B1A8]">
              <th className="py-3 px-4">Lead Name</th>
              <th className="py-3 px-4">Phone / Contact</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Notes & Requirements</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#B4B1A8] font-mono">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#B4B1A8]">
                  No leads recorded in the database yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#F5F3EF]">
                    {lead.name || 'Anonymous Lead'}
                  </td>

                  <td className="py-3 px-4 text-[#B4B1A8]">
                    <p className="font-mono text-xs text-[#F5F3EF]">{lead.phone || '-'}</p>
                    {lead.email && <p className="text-[11px]">{lead.email}</p>}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-white/5 text-[#C8A35F]">
                      {lead.source || 'website'}
                    </span>
                  </td>

                  <td className="py-3 px-4 max-w-xs text-[#B4B1A8]">
                    {lead.notes || 'No notes logged'}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <select
                      value={lead.status || 'new'}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className="px-2.5 py-1 bg-[#0C0D10] border border-white/10 rounded text-[11px] text-[#F5F3EF] capitalize focus:outline-none focus:border-[#C8A35F]"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-[10px] text-[#B4B1A8]/60">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
