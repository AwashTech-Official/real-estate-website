import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Filter,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';
import { getAdminInquiries, updateInquiryStatus } from '../lib/supabase';
import type { InquiryRecord, InquiryStatus } from '../types/database';

export const InquiriesModule: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Internal notes editor in detail view
  const [notesBuffer, setNotesBuffer] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setIsLoading(true);
    const data = await getAdminInquiries();
    setInquiries(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleSelectInquiry = (inq: InquiryRecord) => {
    setSelectedInquiry(inq);
    setNotesBuffer(inq.internal_notes || '');
    setFeedback(null);
  };

  const handleStatusChange = async (inqId: string, newStatus: string) => {
    const res = await updateInquiryStatus(inqId, newStatus);
    if (res.success) {
      setInquiries((prev) =>
        prev.map((i) => (i.id === inqId ? { ...i, status: newStatus as InquiryStatus } : i))
      );
      if (selectedInquiry && selectedInquiry.id === inqId) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus as InquiryStatus } : null));
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSavingNotes(true);
    const res = await updateInquiryStatus(
      selectedInquiry.id,
      selectedInquiry.status as string,
      notesBuffer.trim()
    );
    setIsSavingNotes(false);
    if (res.success) {
      setFeedback('Internal notes saved successfully.');
      setSelectedInquiry((prev) => (prev ? { ...prev, internal_notes: notesBuffer.trim() } : null));
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === selectedInquiry.id ? { ...i, internal_notes: notesBuffer.trim() } : i
        )
      );
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Filtered inquiries
  const filtered = inquiries.filter((inq) => {
    if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
    if (typeFilter !== 'all' && inq.inquiry_type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = inq.name?.toLowerCase().includes(q);
      const matchPhone = inq.phone?.toLowerCase().includes(q);
      const matchEmail = inq.email?.toLowerCase().includes(q);
      const matchMsg = inq.message?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchMsg) return false;
    }
    return true;
  });

  const statusOptions: { value: InquiryStatus; label: string; color: string }[] = [
    { value: 'new', label: 'New', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { value: 'qualified', label: 'Qualified', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { value: 'viewing_requested', label: 'Viewing Requested', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { value: 'viewing_confirmed', label: 'Viewing Confirmed', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { value: 'viewing_completed', label: 'Viewing Completed', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    { value: 'offer_made', label: 'Offer Made', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { value: 'won', label: 'Won / Closed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { value: 'lost', label: 'Lost', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    { value: 'spam', label: 'Spam', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  ];

  const cleanPhoneForWhatsApp = (phoneStr: string) => {
    return phoneStr.replace(/[^0-9+]/g, '').replace(/^\+/, '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F3EF] flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#C8A35F]" />
            <span>Customer Inquiries & Viewings</span>
          </h2>
          <p className="text-xs text-[#B4B1A8] mt-0.5">
            Review incoming public requests, log status updates, and directly contact leads.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInquiries}
          className="text-xs text-[#B4B1A8] hover:text-[#C8A35F] self-start sm:self-auto font-mono py-1"
        >
          Refresh Data ({inquiries.length} total)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#141519] p-3 rounded-xl border border-white/10 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#B4B1A8]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, email..."
            className="w-full pl-9 pr-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] placeholder-[#B4B1A8]/40 focus:outline-none focus:border-[#C8A35F]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[#B4B1A8] font-mono uppercase text-[10px] shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:outline-none focus:border-[#C8A35F]"
          >
            <option value="all">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[#B4B1A8] font-mono uppercase text-[10px] shrink-0">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-2.5 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:outline-none focus:border-[#C8A35F]"
          >
            <option value="all">All Types</option>
            <option value="viewing_request">Viewing Request</option>
            <option value="property_question">Property Question</option>
            <option value="callback">Callback</option>
            <option value="valuation_request">Valuation Request</option>
            <option value="list_property">List Your Property</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#141519]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#0C0D10]/50 font-mono text-[11px] uppercase tracking-wider text-[#B4B1A8]">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Inquiry Type</th>
              <th className="py-3 px-4">Message Preview</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#B4B1A8] font-mono">
                  Loading inquiries...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#B4B1A8]">
                  No inquiries found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((inq) => {
                const badge =
                  statusOptions.find((s) => s.value === inq.status) || statusOptions[0];
                const cleanPhone = cleanPhoneForWhatsApp(inq.phone || '');

                return (
                  <tr
                    key={inq.id}
                    onClick={() => handleSelectInquiry(inq)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    {/* Customer Name & Timestamp */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#F5F3EF]">{inq.name}</p>
                      <p className="text-[10px] text-[#B4B1A8]/60 font-mono">
                        {new Date(inq.created_at).toLocaleString()}
                      </p>
                    </td>

                    {/* Contact Methods */}
                    <td className="py-3 px-4 text-[#B4B1A8]">
                      <p className="font-mono text-xs text-[#F5F3EF]">{inq.phone}</p>
                      {inq.email && <p className="text-[11px]">{inq.email}</p>}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-white/5 text-[#C8A35F] border border-white/10">
                        {inq.inquiry_type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="truncate text-[#B4B1A8]">{inq.message}</p>
                      {inq.internal_notes && (
                        <p className="text-[10px] text-amber-300/80 truncate mt-0.5">
                          Note: {inq.internal_notes}
                        </p>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold border ${badge.color} bg-[#0C0D10] focus:outline-none`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Direct Contact Links */}
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 fill-current" />
                          </a>
                        )}
                        {inq.phone && (
                          <a
                            href={`tel:${inq.phone}`}
                            className="p-1.5 rounded text-[#C8A35F] hover:bg-[#C8A35F]/10 transition-colors"
                            title="Call Phone"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        {inq.email && (
                          <a
                            href={`mailto:${inq.email}`}
                            className="p-1.5 rounded text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inquiry Detail Drawer / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#141519] border border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl text-xs">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0C0D10]/60">
              <div>
                <h3 className="text-base font-bold text-[#F5F3EF]">
                  Inquiry from {selectedInquiry.name}
                </h3>
                <p className="text-[11px] text-[#B4B1A8] font-mono mt-0.5">
                  Received on {new Date(selectedInquiry.created_at).toLocaleString()} via{' '}
                  {selectedInquiry.source || 'website'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-lg text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Direct Quick Actions Bar */}
              <div className="p-3 rounded-xl bg-[#0C0D10] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#B4B1A8] font-mono uppercase text-[10px]">
                    Current Status:
                  </span>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                    className="px-2.5 py-1 bg-[#141519] border border-white/10 rounded font-semibold text-[#F5F3EF]"
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {selectedInquiry.phone && (
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(selectedInquiry.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp Customer</span>
                    </a>
                  )}
                  {selectedInquiry.phone && (
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8A35F] hover:bg-[#DEC07E] text-[#0C0D10] font-semibold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#0C0D10] border border-white/5">
                  <span className="text-[#B4B1A8] block text-[10px] uppercase font-mono">Phone</span>
                  <span className="font-semibold text-[#F5F3EF] font-mono mt-0.5 block">
                    {selectedInquiry.phone}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0C0D10] border border-white/5">
                  <span className="text-[#B4B1A8] block text-[10px] uppercase font-mono">Email</span>
                  <span className="font-semibold text-[#F5F3EF] mt-0.5 block truncate">
                    {selectedInquiry.email || 'None provided'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0C0D10] border border-white/5">
                  <span className="text-[#B4B1A8] block text-[10px] uppercase font-mono">
                    Preferred Method
                  </span>
                  <span className="font-semibold text-[#C8A35F] capitalize mt-0.5 block">
                    {selectedInquiry.preferred_contact_method || 'Phone'}
                  </span>
                </div>
              </div>

              {/* Inquiry Message */}
              <div>
                <label className="block text-[#B4B1A8] font-mono uppercase text-[10px] mb-1.5">
                  Customer Message / Request Details
                </label>
                <div className="p-4 rounded-xl bg-[#0C0D10] border border-white/10 text-[#F5F3EF] leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Property Reference (if applicable) */}
              {selectedInquiry.property_id && (
                <div className="p-3 rounded-lg bg-[#0C0D10] border border-white/5 flex items-center justify-between">
                  <span className="text-[#B4B1A8]">Referenced Property ID:</span>
                  <span className="font-mono text-[#C8A35F]">{selectedInquiry.property_id}</span>
                </div>
              )}

              {/* Internal Agent Notes */}
              <div>
                <label className="block text-amber-300 font-mono uppercase text-[10px] mb-1.5">
                  Internal Notes & Viewing Log (Private - Agent Eyes Only)
                </label>
                <textarea
                  rows={4}
                  value={notesBuffer}
                  onChange={(e) => setNotesBuffer(e.target.value)}
                  placeholder="Record viewing schedules, customer feedback, budget qualification, or agent tasks..."
                  className="w-full p-3 bg-[#0C0D10] border border-amber-500/30 rounded-xl text-amber-200 focus:outline-none focus:border-amber-400 leading-relaxed text-xs"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-emerald-400">{feedback}</span>
                  <button
                    type="button"
                    disabled={isSavingNotes}
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
