import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  getAdminPropertyMedia,
  uploadPropertyMedia,
  deletePropertyMedia,
  setPrimaryPropertyMedia,
  updateMediaSortOrder,
} from '../lib/supabase';
import type { PropertyMedia } from '../types/database';

interface PropertyMediaModalProps {
  property: { id: string; title: string; cover_image_url?: string | null };
  isOpen: boolean;
  onClose: () => void;
  onCoverUpdated?: (newCoverUrl: string) => void;
}

export const PropertyMediaModal: React.FC<PropertyMediaModalProps> = ({
  property,
  isOpen,
  onClose,
  onCoverUpdated,
}) => {
  const [mediaList, setMediaList] = useState<PropertyMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    const data = await getAdminPropertyMedia(property.id);
    setMediaList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, property.id]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setStatusMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadPropertyMedia(property.id, file);
        if (!res.success) {
          setUploadError(res.error || `Failed to upload ${file.name}`);
          break;
        }
      }
      setStatusMessage('Media successfully uploaded to Supabase Storage bucket.');
      await fetchMedia();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimary = async (item: PropertyMedia) => {
    const res = await setPrimaryPropertyMedia(property.id, item.id, item.media_url);
    if (res.success) {
      setStatusMessage('Cover image updated.');
      onCoverUpdated?.(item.media_url);
      await fetchMedia();
    } else {
      setUploadError(res.error || 'Failed to set cover image.');
    }
  };

  const handleDelete = async (item: PropertyMedia) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    const res = await deletePropertyMedia(item.id, item.media_url);
    if (res.success) {
      setStatusMessage('Media removed.');
      await fetchMedia();
    } else {
      setUploadError(res.error || 'Failed to delete media.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaList.length) return;

    const currentItem = mediaList[index];
    const targetItem = mediaList[targetIndex];

    const currentOrder = currentItem.sort_order;
    const targetOrder = targetItem.sort_order;

    await updateMediaSortOrder(currentItem.id, targetOrder);
    await updateMediaSortOrder(targetItem.id, currentOrder);
    await fetchMedia();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#141519] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0C0D10]/50">
          <div>
            <h2 className="text-base font-bold text-[#F5F3EF] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#C8A35F]" />
              <span>Property Media Gallery & Storage</span>
            </h2>
            <p className="text-xs text-[#B4B1A8] mt-0.5">
              Managing media for: <span className="text-[#F5F3EF] font-medium">{property.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Error banners */}
        {uploadError && (
          <div className="m-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{uploadError}</span>
          </div>
        )}
        {statusMessage && (
          <div className="m-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Upload Zone */}
        <div className="p-5 border-b border-white/5 bg-[#0C0D10]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#F5F3EF]">
              Upload New High-Resolution Photos
            </p>
            <p className="text-[11px] text-[#B4B1A8]">
              Target bucket: <code>property-media</code> (Public Read, Admin Write)
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="property-media-file-input"
            />
            <label
              htmlFor="property-media-file-input"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] cursor-pointer transition-colors shadow-md ${
                isUploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#0C0D10] border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to Supabase...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Choose Images to Upload</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-[#B4B1A8] font-mono">
              Loading media items...
            </div>
          ) : mediaList.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <ImageIcon className="w-10 h-10 text-[#B4B1A8]/40 mx-auto" />
              <p className="text-sm font-medium text-[#F5F3EF]">No media uploaded yet</p>
              <p className="text-xs text-[#B4B1A8]">
                Upload photos to display them in the property detail gallery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaList.map((item, idx) => {
                const isCover =
                  item.is_primary || item.media_url === property.cover_image_url;
                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-xl overflow-hidden bg-[#0C0D10] border transition-all ${
                      isCover
                        ? 'border-[#C8A35F] ring-1 ring-[#C8A35F]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="aspect-[16/10] w-full overflow-hidden relative">
                      <img
                        src={item.media_url}
                        alt={item.caption || 'Property media'}
                        className="w-full h-full object-cover"
                      />
                      {isCover && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#C8A35F] text-[#0C0D10] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Cover Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white/80 text-[10px] font-mono">
                        #{item.sort_order}
                      </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="p-2.5 flex items-center justify-between gap-1 bg-[#141519] border-t border-white/5">
                      {/* Set Cover Button */}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C8A35F] hover:text-[#DEC07E] py-1 px-2 rounded hover:bg-white/5"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Set Cover</span>
                        </button>
                      )}
                      {isCover && (
                        <span className="text-[11px] text-[#C8A35F] font-semibold px-2 py-1">
                          Primary Cover
                        </span>
                      )}

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(idx, 'up')}
                          className="p-1.5 text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 rounded disabled:opacity-30 disabled:pointer-events-none"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === mediaList.length - 1}
                          onClick={() => handleMoveOrder(idx, 'down')}
                          className="p-1.5 text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 rounded disabled:opacity-30 disabled:pointer-events-none"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                          title="Delete media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0C0D10]/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-[#F5F3EF] bg-white/10 hover:bg-white/20 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
