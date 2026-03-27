'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { ref, listAll, getDownloadURL, type StorageReference } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Folder, FileText, ChevronRight, ChevronDown, Download, ArrowLeft } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface FolderItem {
  name: string;
  fullPath: string;
  isFolder: boolean;
  url?: string;
}

export default function FileManagerPage() {
  const { pubyUser } = usePubyAuth();
  const [currentPath, setCurrentPath] = useState('puby/organized');
  const [items, setItems] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  const loadFolder = useCallback(async (path: string) => {
    setLoading(true);
    setSelectedPaths(new Set());
    try {
      const folderRef = ref(storage, path);
      const result = await listAll(folderRef);

      const folders: FolderItem[] = result.prefixes.map((p) => ({
        name: p.name,
        fullPath: p.fullPath,
        isFolder: true,
      }));

      const files: FolderItem[] = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return { name: item.name, fullPath: item.fullPath, isFolder: false, url };
        })
      );

      // 폴더 먼저, 파일 뒤에. 각각 이름 역순(최신 먼저)
      folders.sort((a, b) => b.name.localeCompare(a.name));
      files.sort((a, b) => a.name.localeCompare(b.name));

      setItems([...folders, ...files]);
    } catch (err) {
      console.error('Failed to load folder:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolder(currentPath);
  }, [currentPath, loadFolder]);

  if (pubyUser?.role !== 'admin') return null;

  function navigateTo(path: string) {
    setCurrentPath(path);
  }

  function goUp() {
    const parts = currentPath.split('/');
    if (parts.length > 2) {
      setCurrentPath(parts.slice(0, -1).join('/'));
    }
  }

  const isRoot = currentPath === 'puby/organized';
  const breadcrumbs = currentPath.replace('puby/organized', '').split('/').filter(Boolean);

  function toggleSelect(fullPath: string) {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(fullPath)) next.delete(fullPath); else next.add(fullPath);
      return next;
    });
  }

  const allSelected = items.length > 0 && items.every((i) => selectedPaths.has(i.fullPath));
  function toggleSelectAll() {
    if (allSelected) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(items.map((i) => i.fullPath)));
    }
  }

  async function collectFolderFiles(folderPath: string): Promise<{ name: string; url: string }[]> {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    const files: { name: string; url: string }[] = [];

    for (const item of result.items) {
      const url = await getDownloadURL(item);
      files.push({ name: item.name, url });
    }
    for (const prefix of result.prefixes) {
      const subFiles = await collectFolderFiles(prefix.fullPath);
      files.push(...subFiles.map((f) => ({ name: `${prefix.name}/${f.name}`, url: f.url })));
    }
    return files;
  }

  async function handleDownload() {
    const selected = items.filter((i) => selectedPaths.has(i.fullPath));
    if (selected.length === 0) return;

    // 파일 1개이고 폴더가 아니면 직접 다운로드
    if (selected.length === 1 && !selected[0].isFolder && selected[0].url) {
      window.open(selected[0].url, '_blank');
      return;
    }

    // 여러 파일 또는 폴더 → zip
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (const item of selected) {
        if (item.isFolder) {
          const files = await collectFolderFiles(item.fullPath);
          const folder = zip.folder(item.name)!;
          for (const f of files) {
            const res = await fetch(f.url);
            const blob = await res.blob();
            folder.file(f.name, blob);
          }
        } else if (item.url) {
          const res = await fetch(item.url);
          const blob = await res.blob();
          zip.file(item.name, blob);
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const folderName = breadcrumbs[breadcrumbs.length - 1] || '지결파일';
      saveAs(blob, `${folderName}.zip`);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">파일 관리</h1>
        <button
          onClick={handleDownload}
          disabled={selectedPaths.size === 0 || downloading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-default text-text-muted hover:text-text-primary text-sm transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? '압축 중...' : `다운로드${selectedPaths.size > 0 ? ` (${selectedPaths.size})` : ''}`}
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-4 text-text-muted">
        <button onClick={() => setCurrentPath('puby/organized')} className="hover:text-brand-purple transition-colors">
          지결 파일
        </button>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => setCurrentPath(`puby/organized/${breadcrumbs.slice(0, i + 1).join('/')}`)}
              className="hover:text-brand-purple transition-colors truncate max-w-[200px]"
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-text-muted py-12">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-text-muted py-12">
          {isRoot ? '아직 제출된 지결이 없습니다.' : '빈 폴더입니다.'}
        </div>
      ) : (
        <div className="space-y-1">
          {/* 상위 폴더 */}
          {!isRoot && (
            <button onClick={goUp} className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-surface-secondary text-text-muted text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> 상위 폴더
            </button>
          )}

          {/* 전체 선택 */}
          <label className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm text-text-muted hover:text-text-primary">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="accent-brand-purple w-4 h-4" />
            전체 선택 ({selectedPaths.size}/{items.length})
          </label>

          {items.map((item) => {
            const isChecked = selectedPaths.has(item.fullPath);
            return (
              <div
                key={item.fullPath}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isChecked ? 'bg-brand-purple/5 ring-1 ring-brand-purple/20' : 'hover:bg-surface-secondary'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelect(item.fullPath)}
                  className="accent-brand-purple w-4 h-4 shrink-0"
                />
                {item.isFolder ? (
                  <button
                    onClick={() => navigateTo(item.fullPath)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <Folder className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="text-sm text-text-primary truncate">{item.name}</span>
                  </button>
                ) : (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 flex-1 min-w-0"
                  >
                    <FileText className="w-5 h-5 text-text-muted shrink-0" />
                    <span className="text-sm text-brand-purple hover:underline truncate">{item.name}</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
