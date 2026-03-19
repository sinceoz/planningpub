'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ImagePlus,
  Loader2,
  X,
  GripVertical,
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
}

const COLLECTION = 'partners';
const LOGO_MAX_DIM = 400;

const INITIAL_PARTNERS = [
  '한국관광공사',
  '한국청소년활동진흥원',
  '소상공인시장진흥공단',
  '한국정신문화재단',
  'N15 PARTNERS',
  '우리다문화장학재단',
  '인공지능산업융합사업단',
  '연합뉴스',
  '한국청소년정책연구원',
  '가재울청소년센터',
  '경상북도콘텐츠진흥원',
  '오산교육재단',
  '경남창조경제혁신센터',
  '경기도마을공동체지원센터',
  '한국국학진흥원',
  '아동권리보장원',
  '경기도사회적경제원',
  '재외동포청',
  '미주한인상공회의소 총연합회',
];

function resizeLogo(file: File, maxDim: number): Promise<Blob> {
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
        0.9,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTION), orderBy('order'));
      const snapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000),
        ),
      ]);
      if (!snapshot.empty) {
        const data = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as Partner[];
        setPartners(data);
      } else {
        // Firestore empty — seed with initial partners
        const batch = writeBatch(db);
        const colRef = collection(db, COLLECTION);
        for (let i = 0; i < INITIAL_PARTNERS.length; i++) {
          const docRef = doc(colRef);
          batch.set(docRef, { name: INITIAL_PARTNERS[i], logoUrl: '', order: i });
        }
        await batch.commit();
        // Re-read to get IDs
        const seeded = await getDocs(query(colRef, orderBy('order')));
        setPartners(
          seeded.docs.map((d) => ({ ...d.data(), id: d.id }) as Partner),
        );
      }
    } catch {
      setPartners([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const openForm = (partner?: Partner) => {
    if (partner) {
      setEditPartner(partner);
      setFormName(partner.name);
      setFormLogoUrl(partner.logoUrl);
    } else {
      setEditPartner(null);
      setFormName('');
      setFormLogoUrl('');
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditPartner(null);
    setFormName('');
    setFormLogoUrl('');
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const resized = await resizeLogo(file, LOGO_MAX_DIM);
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const storageRef = ref(storage, `partners/${filename}`);
    await uploadBytes(storageRef, resized, { contentType: 'image/webp' });
    return getDownloadURL(storageRef);
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const file = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      setFormLogoUrl(url);
    } catch (err) {
      alert('로고 업로드 실패: ' + String(err));
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleRemoveLogo = () => {
    // Delete from storage if possible
    if (formLogoUrl) {
      try {
        const path = decodeURIComponent(formLogoUrl.split('/o/')[1]?.split('?')[0] || '');
        if (path) deleteObject(ref(storage, path)).catch(() => {});
      } catch {}
    }
    setFormLogoUrl('');
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      alert('파트너 이름을 입력하세요.');
      return;
    }
    setSaving(true);
    try {
      if (editPartner) {
        await updateDoc(doc(db, COLLECTION, editPartner.id), {
          name: formName.trim(),
          logoUrl: formLogoUrl,
        });
      } else {
        await addDoc(collection(db, COLLECTION), {
          name: formName.trim(),
          logoUrl: formLogoUrl,
          order: partners.length,
        });
      }
      closeForm();
      await loadPartners();
    } catch (err) {
      alert('저장 실패: ' + String(err));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      // Delete logo from storage
      if (deleteTarget.logoUrl) {
        try {
          const path = decodeURIComponent(
            deleteTarget.logoUrl.split('/o/')[1]?.split('?')[0] || '',
          );
          if (path) await deleteObject(ref(storage, path));
        } catch {}
      }
      await deleteDoc(doc(db, COLLECTION, deleteTarget.id));
      setDeleteTarget(null);
      await loadPartners();
    } catch (err) {
      alert('삭제 실패: ' + String(err));
    }
  };

  const movePartner = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= partners.length) return;

    const updated = [...partners];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update order values
    const reordered = updated.map((p, i) => ({ ...p, order: i }));
    setPartners(reordered);

    // Batch update Firestore
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, COLLECTION, reordered[index].id), { order: index });
      batch.update(doc(db, COLLECTION, reordered[newIndex].id), { order: newIndex });
      await batch.commit();
    } catch (err) {
      console.error('순서 변경 실패:', err);
      await loadPartners(); // Revert on failure
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">파트너 관리</h1>
          <p className="text-sm text-text-muted mt-1">총 {partners.length}개</p>
        </div>
        <button
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-purple text-white hover:bg-brand-purple-light transition-colors cursor-pointer"
        >
          <Plus size={15} />
          추가
        </button>
      </div>

      {/* Partner List */}
      {loading ? (
        <div className="text-center text-text-muted py-20">데이터 로딩 중...</div>
      ) : partners.length === 0 ? (
        <div className="text-center text-text-muted py-20">
          파트너가 없습니다. 추가 버튼을 눌러 등록하세요.
        </div>
      ) : (
        <div className="space-y-2">
          {partners.map((partner, index) => (
            <div
              key={partner.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border-default bg-bg-card hover:bg-bg-surface-hover transition-colors"
            >
              {/* Order controls */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => movePartner(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-bg-surface disabled:opacity-20 text-text-dim hover:text-text-primary transition-colors cursor-pointer disabled:cursor-default"
                  title="위로"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => movePartner(index, 'down')}
                  disabled={index === partners.length - 1}
                  className="p-1 rounded hover:bg-bg-surface disabled:opacity-20 text-text-dim hover:text-text-primary transition-colors cursor-pointer disabled:cursor-default"
                  title="아래로"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Order number */}
              <span className="text-xs text-text-dim w-6 text-center">{index + 1}</span>

              {/* Logo preview */}
              <div className="w-12 h-12 rounded-lg border border-border-default bg-white flex items-center justify-center overflow-hidden shrink-0">
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <GripVertical size={16} className="text-text-dim" />
                )}
              </div>

              {/* Name */}
              <span className="flex-1 text-sm text-text-primary font-medium truncate">
                {partner.name}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openForm(partner)}
                  className="p-2 rounded-md hover:bg-bg-card text-text-dim hover:text-brand-mint transition-colors cursor-pointer"
                  title="수정"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(partner)}
                  className="p-2 rounded-md hover:bg-bg-card text-text-dim hover:text-error transition-colors cursor-pointer"
                  title="삭제"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add/Edit Form Modal ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeForm}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md rounded-xl bg-bg-card border border-border-default p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-primary mb-6">
              {editPartner ? '파트너 수정' : '파트너 추가'}
            </h3>

            {/* Name */}
            <label className="block mb-4">
              <span className="text-sm text-text-muted mb-1 block">파트너 이름 *</span>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="예: 한국관광공사"
                className="w-full px-4 py-2.5 rounded-lg bg-bg-surface border border-border-default text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-brand-purple"
                autoFocus
              />
            </label>

            {/* Logo Upload */}
            <label className="block mb-6">
              <span className="text-sm text-text-muted mb-1 block">로고 이미지</span>
              {formLogoUrl ? (
                <div className="relative w-full h-32 rounded-lg border border-border-default bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={formLogoUrl}
                    alt="로고 미리보기"
                    className="max-w-full max-h-full object-contain p-3"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-error transition-colors cursor-pointer"
                    title="삭제"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-brand-mint bg-brand-mint/5'
                      : 'border-border-default hover:border-border-hover'
                  } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleFileUpload(e.target.files);
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
                        클릭하거나 드래그하여 로고 업로드
                      </p>
                      <p className="text-xs text-text-dim">PNG, JPG, SVG 등</p>
                    </div>
                  )}
                </div>
              )}
            </label>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm rounded-lg border border-border-default text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-brand-purple text-white font-semibold hover:bg-brand-purple-light transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ─── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md rounded-xl bg-bg-card border border-border-default p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-primary mb-2">삭제 확인</h3>
            <p className="text-sm text-text-muted mb-1">다음 파트너를 삭제하시겠습니까?</p>
            <p className="text-sm text-text-primary font-medium mb-6">
              {deleteTarget.name}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border-default text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-lg bg-error text-white font-semibold hover:bg-red-400 transition-colors cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
