'use client';

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { useTranslations } from 'next-intl';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Upload, X, FileText, ScanSearch } from 'lucide-react';
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
}

interface FileUploadProps {
  files: ExpenseFile[];
  onChange: (files: ExpenseFile[]) => void;
  storagePath: string;
  ocrType?: 'card' | 'vendor';
  onOcrResult?: (result: OcrResult) => void;
}

export default function FileUpload({ files, onChange, storagePath, ocrType, onOcrResult }: FileUploadProps) {
  const t = useTranslations('puby.expense.files');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const runOcr = useCallback(async (url: string, mimeType: string) => {
    if (!ocrType || !onOcrResult || !mimeType.startsWith('image/')) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/puby/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, type: ocrType }),
      });
      if (res.ok) {
        const data = await res.json();
        onOcrResult(data);
      }
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setAnalyzing(false);
    }
  }, [ocrType, onOcrResult]);

  const uploadFiles = useCallback(async (fileList: FileList) => {
    setUploading(true);
    try {
      const newFiles: ExpenseFile[] = [];
      let firstImageUrl = '';
      let firstImageType = '';
      for (const file of Array.from(fileList)) {
        if (file.size > 10 * 1024 * 1024) continue;
        const storageRef = ref(storage, `${storagePath}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        newFiles.push({ name: file.name, url, type: file.type });
        if (!firstImageUrl && file.type.startsWith('image/')) {
          firstImageUrl = url;
          firstImageType = file.type;
        }
      }
      onChange([...files, ...newFiles]);
      // Auto-run OCR on first uploaded image
      if (firstImageUrl) {
        runOcr(firstImageUrl, firstImageType);
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
            <p className="text-xs text-brand-purple">영수증 분석 중...</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" multiple onChange={handleFiles} className="hidden" accept="image/*,.pdf" />

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-surface-secondary rounded-lg">
              <FileText className="w-4 h-4 text-text-muted shrink-0" />
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-purple hover:underline truncate flex-1">
                {file.name}
              </a>
              <button onClick={() => removeFile(i)} className="p-1 text-text-muted hover:text-red-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
