import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, AlertCircle, CheckCircle2, Link as LinkIcon, Camera } from 'lucide-react';
import { api } from '../services/api.js';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  className?: string;
  allowUrlInput?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  label = 'Product / Shop Photo',
  helperText = 'Supports JPG, JPEG, PNG, or WebP up to 5 MB',
  aspectRatio = 'square',
  className = '',
  allowUrlInput = true,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showUrlMode, setShowUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with currentImageUrl when it changes
  React.useEffect(() => {
    if (currentImageUrl !== previewUrl && currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const validateFile = (file: File): string | null => {
    // 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return `File size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed image size is 5 MB.`;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return 'Invalid file format. Please upload a JPG, JPEG, PNG, or WebP photo.';
    }

    return null;
  };

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Upload to server
    setIsUploading(true);
    setUploadProgress(20);

    const timer = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 150);

    try {
      const result = await api.uploadImage(file);
      clearInterval(timer);
      setUploadProgress(100);
      setPreviewUrl(result.url);
      setSuccessMessage('Photo uploaded and verified successfully!');
      onImageUploaded(result.url);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      clearInterval(timer);
      setErrorMessage(err.message || 'Failed to upload photo. Please try again.');
      // Revert if error
      if (currentImageUrl) {
        setPreviewUrl(currentImageUrl);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input value so re-selecting same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setErrorMessage(null);
    setSuccessMessage(null);
    onImageUploaded('');
  };

  const handleApplyManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    setPreviewUrl(manualUrl.trim());
    onImageUploaded(manualUrl.trim());
    setSuccessMessage('Image URL applied');
    setShowUrlMode(false);
    setManualUrl('');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'wide'
      ? 'aspect-[16/9]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'min-h-[160px]';

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
          {label}
        </label>
        {allowUrlInput && (
          <button
            type="button"
            onClick={() => setShowUrlMode(!showUrlMode)}
            className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            {showUrlMode ? 'Switch to File Upload' : 'Or paste URL'}
          </button>
        )}
      </div>

      {showUrlMode ? (
        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
          <p className="text-[11px] text-slate-600">Enter direct image link (e.g. Unsplash or Cloud URL):</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
            <button
              type="button"
              onClick={handleApplyManualUrl}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Hidden native input with device camera / storage integration */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            /* Image Preview Card */
            <div className={`relative rounded-2xl overflow-hidden border border-purple-200 bg-slate-900 group shadow-md ${aspectClass}`}>
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Fallback on broken image
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-emerald-500/90 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    title="Remove photo"
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-3 bg-white/95 hover:bg-white text-slate-900 rounded-xl text-[11px] font-bold shadow flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isUploading ? 'animate-spin' : ''}`} />
                    Replace Photo
                  </button>
                </div>
              </div>

              {isUploading && (
                <div className="absolute inset-0 bg-purple-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white text-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-pink-400" />
                  <p className="text-xs font-bold">Uploading & Verifying Image...</p>
                  <div className="w-32 bg-purple-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-pink-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Drag and Drop / Choose File Box */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
                isDragging
                  ? 'border-purple-600 bg-purple-50 scale-[1.01]'
                  : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-600" />
                  <span>Click to Upload or Drag Photo Here</span>
                </p>
                <p className="text-[11px] text-slate-500">{helperText}</p>
              </div>

              <button
                type="button"
                className="mt-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold border border-purple-200 transition-colors pointer-events-none"
              >
                Choose from Device
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <div className="flex items-start gap-1.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success state */}
      {successMessage && (
        <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
