'use client';

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { useTranslations } from 'next-intl';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Upload, X, FileText, ScanSearch, Eye } from 'lucide-react';
import type { ExpenseFile } from '@/types/puby';

export interface OcrResult {
  // card fields
  storeName?: string;
  amount?: number;
  paymentDateTime?: string;
  cardLastFour?: string;
  description?: string;
  // vendor fields
  companyName?: string;
  businessNumber?: string;
  representative?: string;
  address?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  // labor fields
  name?: string;
  residentId?: string;
  // file classification tags (순서대로 각 파일에 대응)
  fileTags?: string[];
}

interface FileUploadProps {
  files: ExpenseFile[];
  onChange: (files: ExpenseFile[]) => void;
  storagePath: string;
  ocrType?: 'card' | 'vendor' | 'labor';
  onOcrResult?: (result: OcrResult) => void;
}

export default function FileUpload({ files, onChange, storagePath, ocrType, onOcrResult }: FileUploadProps) {
  const t = useTranslations('puby.expense.files');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const runOcr = useCallback(async (ocrUrls: string[], currentFiles: ExpenseFile[]) => {
    if (!ocrType || !onOcrResult || ocrUrls.length === 0) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/puby/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: ocrUrls, type: ocrType }),
      });
      if (res.ok) {
        const data = await res.json();
        // fileTags로 파일에 태그 적용
        if (data.fileTags && Array.isArray(data.fileTags)) {
          const ocrableFiles = currentFiles.filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf');
          const updated = currentFiles.map((f) => {
            const idx = ocrableFiles.indexOf(f);
            if (idx >= 0 && idx < data.fileTags.length) {
              return { ...f, tag: data.fileTags[idx] };
            }
            return f;
          });
          onChange(updated);
        }
        onOcrResult(data);
      }
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setAnalyzing(false);
    }
  }, [ocrType, onOcrResult, onChange]);

  const uploadFiles = useCallback(async (fileList: FileList) => {
    setUploading(true);
    try {
      const newFiles: ExpenseFile[] = [];
      const ocrUrls: string[] = [];
      for (const file of Array.from(fileList)) {
        if (file.size > 10 * 1024 * 1024) continue;
        const storageRef = ref(storage, `${storagePath}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        newFiles.push({ name: file.name, url, type: file.type });
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          ocrUrls.push(url);
        }
      }
      const allFiles = [...files, ...newFiles];
      onChange(allFiles);
      // Run OCR on ALL ocr-able files (existing + new) for multi-document analysis
      const allOcrUrls = allFiles
        .filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf')
        .map((f) => f.url);
      if (allOcrUrls.length > 0) {
        runOcr(allOcrUrls, allFiles);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [files, onChange, storagePath, runOcr]);

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(e.target.files);
  }

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-brand-purple bg-brand-purple/5'
            : 'border-border-default hover:border-brand-purple/50'
        }`}
      >
        <Upload className="w-6 h-6 mx-auto mb-2 text-text-muted" />
        <p className="text-sm text-text-muted">{t('dragDrop')}</p>
        <p className="text-xs text-text-muted mt-1">{t('maxSize')}</p>
        {uploading && <p className="text-xs text-brand-purple mt-2">업로드 중...</p>}
        {analyzing && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <ScanSearch className="w-4 h-4 text-brand-purple animate-pulse" />
            <p className="text-xs text-brand-purple">서류 분석 중...</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" multiple onChange={handleFiles} className="hidden" accept="image/*,.pdf" />

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="bg-surface-secondary rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-2">
                {isImage(file.type) ? (
                  <img src={file.url} alt={file.name} className="w-8 h-8 rounded object-cover shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 text-text-muted shrink-0" />
                )}
                <span className="text-sm text-text-primary truncate flex-1">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewUrl(previewUrl === file.url ? null : file.url); }}
                  className="p-1 text-text-muted hover:text-brand-purple"
                  title="미리보기"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => removeFile(i)} className="p-1 text-text-muted hover:text-red-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {previewUrl === file.url && (
                <div className="border-t border-border-default p-2">
                  {isImage(file.type) ? (
                    <img src={file.url} alt={file.name} className="max-h-80 w-full object-contain rounded" />
                  ) : (
                    <iframe src={file.url} className="w-full h-80 rounded" title={file.name} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
