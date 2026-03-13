'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { PortfolioItem } from '@/types';

interface PortfolioFormProps {
  item: PortfolioItem | null;
  nextOrder: number;
  onSave: (data: Omit<PortfolioItem, 'id'> & { id?: string }) => Promise<void>;
  onClose: () => void;
}

export default function PortfolioForm({ item, nextOrder, onSave, onClose }: PortfolioFormProps) {
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: item?.title || '',
    titleEn: item?.titleEn || '',
    description: item?.description || '',
    descriptionEn: item?.descriptionEn || '',
    year: item?.year || new Date().getFullYear(),
    order: item?.order || nextOrder,
    featured: item?.featured || false,
    date: item?.date || '',
    venue: item?.venue || '',
    venueEn: item?.venueEn || '',
    organizer: item?.organizer || '',
    organizerEn: item?.organizerEn || '',
    concept: item?.concept || '',
    conceptEn: item?.conceptEn || '',
    planningPoint: item?.planningPoint || '',
    planningPointEn: item?.planningPointEn || '',
    images: item?.images?.join(', ') || '',
  });

  const set = (field: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return alert('행사명(한글)을 입력하세요.');
    if (!form.year) return alert('연도를 입력하세요.');

    setSaving(true);
    const images = form.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await onSave({
      ...(item?.id ? { id: item.id } : {}),
      title: form.title.trim(),
      titleEn: form.titleEn.trim(),
      description: form.description.trim(),
      descriptionEn: form.descriptionEn.trim(),
      year: Number(form.year),
      order: Number(form.order),
      featured: form.featured,
      date: form.date.trim(),
      venue: form.venue.trim(),
      venueEn: form.venueEn.trim(),
      organizer: form.organizer.trim(),
      organizerEn: form.organizerEn.trim(),
      concept: form.concept.trim(),
      conceptEn: form.conceptEn.trim(),
      planningPoint: form.planningPoint.trim(),
      planningPointEn: form.planningPointEn.trim(),
      images,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-3xl rounded-xl bg-bg-card border border-border-default shadow-2xl mb-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h2 className="text-lg font-bold text-text-primary">
            {isEdit ? '포트폴리오 수정' : '포트폴리오 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-bg-surface text-text-dim hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <fieldset>
            <legend className="text-sm font-semibold text-brand-mint tracking-wider uppercase mb-4">
              기본 정보
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="행사명 (한글) *" value={form.title} onChange={(v) => set('title', v)} />
              <Field label="행사명 (영문)" value={form.titleEn} onChange={(v) => set('titleEn', v)} />
              <Field label="설명 (한글)" value={form.description} onChange={(v) => set('description', v)} />
              <Field label="설명 (영문)" value={form.descriptionEn} onChange={(v) => set('descriptionEn', v)} />
              <div className="grid grid-cols-3 gap-3">
                <Field
                  label="연도 *"
                  type="number"
                  value={String(form.year)}
                  onChange={(v) => set('year', parseInt(v) || 0)}
                />
                <Field
                  label="순서"
                  type="number"
                  value={String(form.order)}
                  onChange={(v) => set('order', parseInt(v) || 0)}
                />
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => set('featured', e.target.checked)}
                      className="w-4 h-4 rounded border-border-default accent-brand-purple"
                    />
                    <span className="text-sm text-text-muted">대표</span>
                  </label>
                </div>
              </div>
              <Field label="날짜" value={form.date} onChange={(v) => set('date', v)} placeholder="2025. 5. 23. - 25." />
            </div>
          </fieldset>

          {/* 장소 & 주최 */}
          <fieldset>
            <legend className="text-sm font-semibold text-brand-mint tracking-wider uppercase mb-4">
              장소 & 주최/주관
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="장소 (한글)" value={form.venue} onChange={(v) => set('venue', v)} />
              <Field label="장소 (영문)" value={form.venueEn} onChange={(v) => set('venueEn', v)} />
              <Field
                label="주최/주관 (한글)"
                value={form.organizer}
                onChange={(v) => set('organizer', v)}
                placeholder="주최기관 / 주관기관"
              />
              <Field
                label="주최/주관 (영문)"
                value={form.organizerEn}
                onChange={(v) => set('organizerEn', v)}
                placeholder="Host / Organizer"
              />
            </div>
            <p className="text-xs text-text-dim mt-2">
              주최와 주관은 <code className="text-brand-mint">/</code> 로 구분합니다. 예: 여성가족부 / 한국청소년활동진흥원
            </p>
          </fieldset>

          {/* 콘셉트 & 기획 포인트 */}
          <fieldset>
            <legend className="text-sm font-semibold text-brand-mint tracking-wider uppercase mb-4">
              Concept & Planning Point
            </legend>
            <div className="space-y-4">
              <TextArea label="Concept (한글)" value={form.concept} onChange={(v) => set('concept', v)} rows={3} />
              <TextArea label="Concept (영문)" value={form.conceptEn} onChange={(v) => set('conceptEn', v)} rows={3} />
              <TextArea label="Planning Point (한글)" value={form.planningPoint} onChange={(v) => set('planningPoint', v)} rows={3} />
              <TextArea label="Planning Point (영문)" value={form.planningPointEn} onChange={(v) => set('planningPointEn', v)} rows={3} />
            </div>
          </fieldset>

          {/* 이미지 */}
          <fieldset>
            <legend className="text-sm font-semibold text-brand-mint tracking-wider uppercase mb-4">
              이미지
            </legend>
            <TextArea
              label="이미지 URL (쉼표로 구분)"
              value={form.images}
              onChange={(v) => set('images', v)}
              rows={2}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
            />
          </fieldset>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm rounded-lg border border-border-default text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand-purple text-white hover:bg-brand-purple-light transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? '저장 중...' : isEdit ? '수정 완료' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-text-dim mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-bg-dark border border-border-default text-text-primary text-sm placeholder:text-text-dim/50 focus:outline-none focus:border-brand-purple transition-colors"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-text-dim mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-bg-dark border border-border-default text-text-primary text-sm placeholder:text-text-dim/50 focus:outline-none focus:border-brand-purple transition-colors resize-y"
      />
    </div>
  );
}
