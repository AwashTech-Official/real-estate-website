import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Star,
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  Building,
  Eye,
  Archive,
  Save,
} from 'lucide-react';
import {
  getAdminProperties,
  saveAdminProperty,
  deleteAdminProperty,
} from '../lib/supabase';
import type { AdminProperty } from '../types/database';
import { PropertyMediaModal } from './PropertyMediaModal';
import { formatPrice } from '../utils/formatters';

export const PropertiesModule: React.FC = () => {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Partial<AdminProperty> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Repeatable input buffers for amenities & highlights
  const [amenityInputEn, setAmenityInputEn] = useState('');
  const [amenityInputAm, setAmenityInputAm] = useState('');
  const [highlightInputEn, setHighlightInputEn] = useState('');
  const [highlightInputAm, setHighlightInputAm] = useState('');

  // Media Manager state
  const [mediaTarget, setMediaTarget] = useState<AdminProperty | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    const data = await getAdminProperties();
    setProperties(data as AdminProperty[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateNew = () => {
    setEditingProperty({
      title: '',
      title_am: '',
      slug: '',
      description: '',
      description_am: '',
      listing_type: 'sale',
      property_type: 'villa',
      subcity: 'Bole',
      public_location_text: '',
      address_internal: '',
      internal_notes: '',
      price: 0,
      price_on_request: false,
      display_price: true,
      bedrooms: 4,
      bathrooms: 4,
      area_sqm: 350,
      cover_image_url: '',
      is_published: true,
      publication_status: 'published',
      sale_status: 'available',
      is_featured: false,
      is_demo: false,
      sort_order: (properties.length + 1) * 10,
      amenities: ['Generator Back-up', 'Modern Kitchen', 'Security Fence'],
      amenities_am: ['ጄኔሬተር', 'ዘመናዊ ወጥ ቤት', 'የደህንነት አጥር'],
      highlights: ['Prime residential street', 'Ready title deed transfer'],
      highlights_am: ['ተመራጭ የመኖሪያ ሰፈር', 'ንጹህ የካርታ ባለቤትነት ዝውውር'],
    });
    setAmenityInputEn('');
    setAmenityInputAm('');
    setHighlightInputEn('');
    setHighlightInputAm('');
    setIsEditorOpen(true);
  };

  const handleEdit = (prop: AdminProperty) => {
    setEditingProperty({
      ...prop,
      amenities: prop.amenities || [],
      amenities_am: prop.amenities_am || [],
      highlights: prop.highlights || [],
      highlights_am: prop.highlights_am || [],
      publication_status:
        prop.publication_status || (prop.is_published ? 'published' : 'draft'),
      sale_status: prop.sale_status || 'available',
    });
    setAmenityInputEn('');
    setAmenityInputAm('');
    setHighlightInputEn('');
    setHighlightInputAm('');
    setIsEditorOpen(true);
  };

  const handleDelete = async (prop: AdminProperty) => {
    if (!confirm(`Are you sure you want to delete "${prop.title}"?`)) return;
    const res = await deleteAdminProperty(prop.id);
    if (res.success) {
      showFeedback('success', 'Property successfully deleted.');
      fetchProperties();
    } else {
      showFeedback('error', res.error || 'Failed to delete property.');
    }
  };

  // Quick action: Toggle Publication Status
  const handleTogglePublication = async (prop: AdminProperty) => {
    const nextPub = prop.publication_status === 'published' ? 'draft' : 'published';
    const isPubBool = nextPub === 'published';
    const res = await saveAdminProperty({
      id: prop.id,
      publication_status: nextPub,
      is_published: isPubBool,
    });
    if (res.success) {
      showFeedback('success', `Property marked as ${nextPub}.`);
      fetchProperties();
    }
  };

  // Quick action: Toggle Sale Status
  const handleChangeSaleStatus = async (prop: AdminProperty, nextStatus: string) => {
    const res = await saveAdminProperty({
      id: prop.id,
      sale_status: nextStatus,
    });
    if (res.success) {
      showFeedback('success', `Status updated to ${nextStatus}.`);
      fetchProperties();
    }
  };

  // Quick action: Toggle Featured
  const handleToggleFeatured = async (prop: AdminProperty) => {
    const nextFeatured = !prop.is_featured;
    const res = await saveAdminProperty({
      id: prop.id,
      is_featured: nextFeatured,
    });
    if (res.success) {
      showFeedback('success', nextFeatured ? 'Marked as Featured.' : 'Removed from Featured.');
      fetchProperties();
    }
  };

  // Quick action: Change Sort Order
  const handleSortOrderChange = async (prop: AdminProperty, newOrder: number) => {
    await saveAdminProperty({ id: prop.id, sort_order: newOrder });
    fetchProperties();
  };

  // Save full property form
  const handleSavePropertyForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    // Validation
    if (!editingProperty.title?.trim()) {
      alert('Please provide an English title.');
      return;
    }

    let slug = editingProperty.slug?.trim() || '';
    if (!slug) {
      slug = (editingProperty.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    setIsSaving(true);

    const payload = {
      ...editingProperty,
      slug,
      is_published: editingProperty.publication_status === 'published',
      price: Number(editingProperty.price) || 0,
      bedrooms: editingProperty.bedrooms ? Number(editingProperty.bedrooms) : null,
      bathrooms: editingProperty.bathrooms ? Number(editingProperty.bathrooms) : null,
      area_sqm: editingProperty.area_sqm ? Number(editingProperty.area_sqm) : null,
      sort_order: Number(editingProperty.sort_order) || 0,
    };

    const res = await saveAdminProperty(payload);
    setIsSaving(false);

    if (res.success) {
      showFeedback('success', 'Property successfully saved to database.');
      setIsEditorOpen(false);
      setEditingProperty(null);
      fetchProperties();
    } else {
      showFeedback('error', res.error || 'Failed to save property.');
    }
  };

  // Repeatable amenities add/remove
  const handleAddAmenity = () => {
    if (!amenityInputEn.trim() && !amenityInputAm.trim()) return;
    setEditingProperty((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        amenities: [...(prev.amenities || []), amenityInputEn.trim() || amenityInputAm.trim()],
        amenities_am: [...(prev.amenities_am || []), amenityInputAm.trim() || amenityInputEn.trim()],
      };
    });
    setAmenityInputEn('');
    setAmenityInputAm('');
  };

  const handleRemoveAmenity = (idx: number) => {
    setEditingProperty((prev) => {
      if (!prev) return prev;
      const nextEn = [...(prev.amenities || [])];
      const nextAm = [...(prev.amenities_am || [])];
      nextEn.splice(idx, 1);
      nextAm.splice(idx, 1);
      return { ...prev, amenities: nextEn, amenities_am: nextAm };
    });
  };

  // Repeatable highlights add/remove
  const handleAddHighlight = () => {
    if (!highlightInputEn.trim() && !highlightInputAm.trim()) return;
    setEditingProperty((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        highlights: [...(prev.highlights || []), highlightInputEn.trim() || highlightInputAm.trim()],
        highlights_am: [...(prev.highlights_am || []), highlightInputAm.trim() || highlightInputEn.trim()],
      };
    });
    setHighlightInputEn('');
    setHighlightInputAm('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setEditingProperty((prev) => {
      if (!prev) return prev;
      const nextEn = [...(prev.highlights || [])];
      const nextAm = [...(prev.highlights_am || [])];
      nextEn.splice(idx, 1);
      nextAm.splice(idx, 1);
      return { ...prev, highlights: nextEn, highlights_am: nextAm };
    });
  };

  // Filtered properties
  const filtered = properties.filter((p) => {
    if (statusFilter !== 'all') {
      const pub = p.publication_status || (p.is_published ? 'published' : 'draft');
      if (pub !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q) || p.title_am?.toLowerCase().includes(q);
      const matchLoc = p.public_location_text?.toLowerCase().includes(q) || p.subcity?.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Module Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F3EF] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#C8A35F]" />
            <span>Properties Inventory</span>
          </h2>
          <p className="text-xs text-[#B4B1A8] mt-0.5">
            Manage real estate listings, pricing, bilingual descriptions, and media.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-colors shadow-md min-h-[40px] whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/40 border-red-500/30 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141519] p-3 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#B4B1A8]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, subcity, or location..."
            className="w-full pl-9 pr-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-xs text-[#F5F3EF] placeholder-[#B4B1A8]/40 focus:outline-none focus:border-[#C8A35F]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#B4B1A8] font-mono uppercase">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-xs text-[#F5F3EF] focus:outline-none focus:border-[#C8A35F]"
          >
            <option value="all">All Statuses ({properties.length})</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#141519]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#0C0D10]/50 font-mono text-[11px] uppercase tracking-wider text-[#B4B1A8]">
              <th className="py-3 px-4">Property</th>
              <th className="py-3 px-4">Subcity & Specs</th>
              <th className="py-3 px-4">Price (ETB)</th>
              <th className="py-3 px-4 text-center">Publication</th>
              <th className="py-3 px-4 text-center">Sale Status</th>
              <th className="py-3 px-4 text-center">Featured</th>
              <th className="py-3 px-4 text-center">Order</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#B4B1A8] font-mono">
                  Loading properties inventory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#B4B1A8]">
                  No properties matched your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((prop) => {
                const pubStatus =
                  prop.publication_status || (prop.is_published ? 'published' : 'draft');
                const saleStatus = prop.sale_status || 'available';

                return (
                  <tr key={prop.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Cover & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-11 rounded-lg overflow-hidden bg-[#0C0D10] shrink-0 border border-white/10 relative">
                          <img
                            src={prop.cover_image_url || '/placeholder-property.jpg'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="max-w-xs">
                          <p className="font-semibold text-[#F5F3EF] truncate">{prop.title}</p>
                          {prop.title_am && (
                            <p className="text-[11px] text-[#B4B1A8] truncate">{prop.title_am}</p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#B4B1A8]">
                              {prop.listing_type}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#B4B1A8]">
                              {prop.property_type}
                            </span>
                            {prop.is_demo && (
                              <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Demo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subcity & Specs */}
                    <td className="py-3 px-4 text-[#B4B1A8]">
                      <p className="text-[#F5F3EF] font-medium">{prop.subcity || 'Addis Ababa'}</p>
                      <p className="text-[11px]">
                        {prop.bedrooms ?? '-'} beds · {prop.bathrooms ?? '-'} baths ·{' '}
                        {prop.area_sqm || prop.area ? `${prop.area_sqm || prop.area} m²` : '-'}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#F5F3EF]">
                        {formatPrice(prop.price, prop.price_on_request, prop.display_price, 'en')}
                      </span>
                    </td>

                    {/* Publication Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublication(prop)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                          pubStatus === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : pubStatus === 'draft'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 hover:bg-zinc-500/20'
                        }`}
                      >
                        {pubStatus}
                      </button>
                    </td>

                    {/* Sale Status Dropdown */}
                    <td className="py-3 px-4 text-center">
                      <select
                        value={saleStatus}
                        onChange={(e) => handleChangeSaleStatus(prop, e.target.value)}
                        className="px-2 py-1 bg-[#0C0D10] border border-white/10 rounded text-[11px] text-[#F5F3EF] focus:outline-none focus:border-[#C8A35F]"
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(prop)}
                        className={`p-1.5 rounded transition-colors ${
                          prop.is_featured
                            ? 'text-[#C8A35F] bg-[#C8A35F]/10 border border-[#C8A35F]/30'
                            : 'text-[#B4B1A8]/40 hover:text-[#B4B1A8]'
                        }`}
                        title={prop.is_featured ? 'Featured on homepage' : 'Not featured'}
                      >
                        <Star className={`w-4 h-4 ${prop.is_featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    {/* Sort Order */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        defaultValue={prop.sort_order ?? 0}
                        onBlur={(e) =>
                          handleSortOrderChange(prop, parseInt(e.target.value, 10) || 0)
                        }
                        className="w-14 px-1.5 py-0.5 text-center bg-[#0C0D10] border border-white/10 rounded text-xs text-[#F5F3EF]"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setMediaTarget(prop)}
                          className="p-1.5 text-[#C8A35F] hover:bg-[#C8A35F]/10 rounded transition-colors"
                          title="Manage media & gallery"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(prop)}
                          className="p-1.5 text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 rounded transition-colors"
                          title="Edit property details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prop)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                          title="Delete property"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Property Media Modal */}
      {mediaTarget && (
        <PropertyMediaModal
          property={mediaTarget}
          isOpen={Boolean(mediaTarget)}
          onClose={() => {
            setMediaTarget(null);
            fetchProperties();
          }}
          onCoverUpdated={(newUrl) => {
            setMediaTarget((prev) => (prev ? { ...prev, cover_image_url: newUrl } : null));
          }}
        />
      )}

      {/* Full Edit / Create Modal */}
      {isEditorOpen && editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#141519] border border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0C0D10]/60">
              <h3 className="text-base font-bold text-[#F5F3EF]">
                {editingProperty.id ? 'Edit Property Listing' : 'Create New Property'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-lg text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields Body */}
            <form onSubmit={handleSavePropertyForm} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Section 1: Titles & Slug */}
              <div className="space-y-4">
                <h4 className="font-mono uppercase tracking-wider text-[#C8A35F] text-[11px]">
                  1. Titles & URL Slug
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingProperty.title || ''}
                      onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                      placeholder="e.g. Modern Luxury Villa in Bole Rwanda"
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Title (Amharic)</label>
                    <input
                      type="text"
                      value={editingProperty.title_am || ''}
                      onChange={(e) => setEditingProperty({ ...editingProperty, title_am: e.target.value })}
                      placeholder="ምሳሌ፡ ቦሌ ሩዋንዳ የሚገኝ ዘመናዊ የቅንጦት ቪላ"
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#B4B1A8] mb-1">
                    URL Slug (auto-generated from title if blank)
                  </label>
                  <input
                    type="text"
                    value={editingProperty.slug || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, slug: e.target.value })}
                    placeholder="modern-luxury-villa-bole-rwanda"
                    className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] font-mono"
                  />
                </div>
              </div>

              {/* Section 2: Property Classification & Location */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="font-mono uppercase tracking-wider text-[#C8A35F] text-[11px]">
                  2. Classification & Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Listing Type</label>
                    <select
                      value={editingProperty.listing_type || 'sale'}
                      onChange={(e) => setEditingProperty({ ...editingProperty, listing_type: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Property Type</label>
                    <select
                      value={editingProperty.property_type || 'villa'}
                      onChange={(e) => setEditingProperty({ ...editingProperty, property_type: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    >
                      <option value="villa">Villa</option>
                      <option value="apartment">Apartment</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land & Plots</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Subcity</label>
                    <select
                      value={editingProperty.subcity || 'Bole'}
                      onChange={(e) => setEditingProperty({ ...editingProperty, subcity: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    >
                      <option value="Bole">Bole</option>
                      <option value="Kirkos">Kirkos</option>
                      <option value="Yeka">Yeka</option>
                      <option value="Nifas Silk-Lafto">Nifas Silk-Lafto</option>
                      <option value="Gulele">Gulele</option>
                      <option value="Lideta">Lideta</option>
                      <option value="Arada">Arada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Public Location Text (Shown publicly)</label>
                    <input
                      type="text"
                      value={editingProperty.public_location_text || ''}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, public_location_text: e.target.value })
                      }
                      placeholder="e.g. Bole Rwanda, near Japanese Embassy"
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B4B1A8] mb-1 text-amber-300">
                      Internal Exact Address (Admin Only - Never Public)
                    </label>
                    <input
                      type="text"
                      value={editingProperty.address_internal || ''}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, address_internal: e.target.value })
                      }
                      placeholder="e.g. Woreda 03, House #142, Owner: Ato Girma"
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-amber-500/30 rounded-lg text-amber-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Pricing & Specs */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="font-mono uppercase tracking-wider text-[#C8A35F] text-[11px]">
                  3. Pricing & Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Price (ETB) *</label>
                    <input
                      type="number"
                      required
                      value={editingProperty.price ?? 0}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={editingProperty.bedrooms ?? ''}
                      onChange={(e) =>
                        setEditingProperty({
                          ...editingProperty,
                          bedrooms: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Bathrooms</label>
                    <input
                      type="number"
                      value={editingProperty.bathrooms ?? ''}
                      onChange={(e) =>
                        setEditingProperty({
                          ...editingProperty,
                          bathrooms: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Area (sqm)</label>
                    <input
                      type="number"
                      value={editingProperty.area_sqm ?? editingProperty.area ?? ''}
                      onChange={(e) =>
                        setEditingProperty({
                          ...editingProperty,
                          area_sqm: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-[#F5F3EF]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProperty.display_price)}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, display_price: e.target.checked })
                      }
                      className="rounded bg-[#0C0D10] border-white/20 text-[#C8A35F]"
                    />
                    <span>Display Price Publicly</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-[#F5F3EF]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProperty.price_on_request)}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, price_on_request: e.target.checked })
                      }
                      className="rounded bg-[#0C0D10] border-white/20 text-[#C8A35F]"
                    />
                    <span>Price On Request (hides exact number)</span>
                  </label>
                </div>
              </div>

              {/* Section 4: Descriptions */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="font-mono uppercase tracking-wider text-[#C8A35F] text-[11px]">
                  4. Descriptions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Description (English)</label>
                    <textarea
                      rows={4}
                      value={editingProperty.description || ''}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, description: e.target.value })
                      }
                      placeholder="Detailed architectural and lifestyle description..."
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Description (Amharic)</label>
                    <textarea
                      rows={4}
                      value={editingProperty.description_am || ''}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, description_am: e.target.value })
                      }
                      placeholder="ስለ ቤቱ ዝርዝር መረጃ..."
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] leading-relaxed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-amber-300 mb-1">
                    Internal Agent Notes (Admin Only - Never Public)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProperty.internal_notes || ''}
                    onChange={(e) =>
                      setEditingProperty({ ...editingProperty, internal_notes: e.target.value })
                    }
                    placeholder="Private notes: legal title condition, broker commission, seller timeline..."
                    className="w-full px-3 py-2 bg-[#0C0D10] border border-amber-500/30 rounded-lg text-amber-200"
                  />
                </div>
              </div>

              {/* Section 5: Repeatable Amenities & Highlights */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="font-mono uppercase tracking-wider text-[#C8A35F] text-[11px]">
                  5. Amenities & Highlights (Repeatable Lists)
                </h4>

                {/* Amenities */}
                <div className="space-y-2">
                  <span className="text-[#B4B1A8] font-medium block">Amenities</span>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingProperty.amenities?.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0C0D10] border border-white/10 text-[#F5F3EF]"
                      >
                        <span>{amenity}</span>
                        {editingProperty.amenities_am?.[idx] && (
                          <span className="text-[#B4B1A8]/60">({editingProperty.amenities_am[idx]})</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(idx)}
                          className="hover:text-red-400 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add amenity (EN)"
                      value={amenityInputEn}
                      onChange={(e) => setAmenityInputEn(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                    <input
                      type="text"
                      placeholder="Add amenity (AM)"
                      value={amenityInputAm}
                      onChange={(e) => setAmenityInputAm(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAmenity}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#F5F3EF]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-2 pt-2">
                  <span className="text-[#B4B1A8] font-medium block">Property Highlights</span>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingProperty.highlights?.map((hl, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0C0D10] border border-white/10 text-[#F5F3EF]"
                      >
                        <span>{hl}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="hover:text-red-400 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Highlight bullet (EN)"
                      value={highlightInputEn}
                      onChange={(e) => setHighlightInputEn(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                    <input
                      type="text"
                      placeholder="Highlight bullet (AM)"
                      value={highlightInputAm}
                      onChange={(e) => setHighlightInputAm(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#F5F3EF]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 6: Status & Controls */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="font-mono uppercase tracking-wider text-[#C8A35F] text-[11px]">
                  6. Status & Controls
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Publication Status</label>
                    <select
                      value={editingProperty.publication_status || 'published'}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, publication_status: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Sale / Rent Status</label>
                    <select
                      value={editingProperty.sale_status || 'available'}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, sale_status: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#B4B1A8] mb-1">Sort Order (Rank)</label>
                    <input
                      type="number"
                      value={editingProperty.sort_order ?? 0}
                      onChange={(e) =>
                        setEditingProperty({
                          ...editingProperty,
                          sort_order: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF]"
                    />
                  </div>

                  <div className="flex flex-col justify-center space-y-2 pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-[#F5F3EF]">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProperty.is_featured)}
                        onChange={(e) =>
                          setEditingProperty({ ...editingProperty, is_featured: e.target.checked })
                        }
                        className="rounded bg-[#0C0D10] border-white/20 text-[#C8A35F]"
                      />
                      <span>Featured on Home</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-[#F5F3EF]">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProperty.is_demo)}
                        onChange={(e) =>
                          setEditingProperty({ ...editingProperty, is_demo: e.target.checked })
                        }
                        className="rounded bg-[#0C0D10] border-white/20 text-[#C8A35F]"
                      />
                      <span>Demo Listing Tag</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[#B4B1A8] mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={editingProperty.cover_image_url || ''}
                    onChange={(e) =>
                      setEditingProperty({ ...editingProperty, cover_image_url: e.target.value })
                    }
                    placeholder="https://... or choose from media gallery"
                    className="w-full px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] font-mono"
                  />
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Property Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
