'use client';

import { useState, useRef, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { ImagePlus, X, Star, Loader2 } from 'lucide-react';

const MAX_IMAGES = 10;
const THUMB_MAX = 600; // thumbnail max dimension

interface ImageUploaderProps {
  /** Current image URLs */
  images: string[];
  /** Current thumbnail URL */
  thumbnail: string;
  /** Portfolio item ID (for storage path) */
  itemId: string;
  onChange: (images: string[], thumbnail: string) => void;
}

/** Resize image on a canvas and return as Blob */
function resizeImage(file: File, maxDim: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/webp',
        0.85,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUploader({ images, thumbnail, itemId, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const storagePath = (filename: string) => `portfolios/${itemId}/${filename}`;

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (fileArr.length === 0) return;

      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        alert(`최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
        return;
      }
      const toUpload = fileArr.slice(0, remaining);

      setUploading(true);
      const newUrls: string[] = [];

      for (const file of toUpload) {
        try {
          // Resize for storage efficiency
          const resized = await resizeImage(file, 1600);
          const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
          const storageRef = ref(storage, storagePath(filename));
          await uploadBytes(storageRef, resized, { contentType: 'image/webp' });
          const url = await getDownloadURL(storageRef);
          newUrls.push(url);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }

      const updatedImages = [...images, ...newUrls];
      // If no thumbnail yet, set first image as thumbnail
      const updatedThumb = thumbnail || (updatedImages.length > 0 ? updatedImages[0] : '');
      onChange(updatedImages, updatedThumb);
      setUploading(false);
    },
    [images, thumbnail, itemId, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles],
  );

  const handleRemove = async (url: string) => {
    // Try to delete from storage
    try {
      const path = decodeURIComponent(url.split('/o/')[1]?.split('?')[0] || '');
      if (path) await deleteObject(ref(storage, path));
    } catch {
      // May fail if URL format is different; ignore
    }

    const updated = images.filter((u) => u !== url);
    const newThumb = thumbnail === url ? (updated[0] || '') : thumbnail;
    onChange(updated, newThumb);
  };

  const handleSetThumbnail = (url: string) => {
    onChange(images, url);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-brand-mint bg-brand-mint/5'
            : 'border-border-default hover:border-border-hover'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = '';
          }}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-text-muted">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">업로드 중...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImagePlus size={24} className="text-text-dim" />
            <p className="text-sm text-text-muted">
              클릭하거나 드래그하여 이미지 업로드
            </p>
            <p className="text-xs text-text-dim">
              {images.length}/{MAX_IMAGES}장 (최대 10장)
            </p>
          </div>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((url) => {
            const isThumb = url === thumbnail;
            return (
              <div
                key={url}
                className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  isThumb ? 'border-brand-mint' : 'border-transparent'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  {/* Set as thumbnail */}
                  <button
                    type="button"
                    onClick={() => handleSetThumbnail(url)}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      isThumb
                        ? 'bg-brand-mint text-black'
                        : 'bg-black/50 text-white hover:bg-brand-mint hover:text-black'
                    }`}
                    title="대표 이미지로 설정"
                  >
                    <Star size={14} className={isThumb ? 'fill-current' : ''} />
                  </button>
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    className="p-1.5 rounded-full bg-black/50 text-white hover:bg-error transition-colors cursor-pointer"
                    title="삭제"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Thumbnail badge */}
                {isThumb && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-mint text-black">
                    대표
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
