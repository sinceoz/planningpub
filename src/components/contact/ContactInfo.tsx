'use client';

import { useTranslations, useLocale } from 'next-intl';
import { COMPANY } from '@/lib/constants';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactInfo() {
  const t = useTranslations('contact.info');
  const locale = useLocale();

  const info = [
    { icon: MapPin, label: t('address'), value: locale === 'ko' ? COMPANY.address : COMPANY.addressEn },
    { icon: Phone, label: t('phone'), value: `${COMPANY.phone} / ${t('fax')}: ${COMPANY.fax}` },
    { icon: Mail, label: t('email'), value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  ];

  return (
    <div className="space-y-6">
      {info.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-brand-purple" />
            </div>
            <div>
              <p className="text-xs text-text-dim uppercase tracking-wider">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="text-sm text-text-primary hover:text-brand-mint transition-colors">
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-text-primary">{item.value}</p>
              )}
            </div>
          </div>
        );
      })}


      {/* 지도 (구글맵 임베드) */}
      <div className="rounded-xl overflow-hidden border border-border-default aspect-video">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d790.8!2d126.9945!3d37.4926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca159e0b76b3d%3A0x7e11379090d2bad6!2z7ISc7Jq47Yq567OE7IucIOyEnOy0iOq1rCDshJzstIjrjIDroZwgMTMx!5e0!3m2!1sko!2skr!4v1700000000000"
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="PlanningPub Office Location"
        />
      </div>
    </div>
  );
}
