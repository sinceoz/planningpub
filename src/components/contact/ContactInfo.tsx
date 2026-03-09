'use client';

import { useTranslations, useLocale } from 'next-intl';
import { COMPANY, SOCIAL_LINKS } from '@/lib/constants';
import { MapPin, Phone, Mail, Instagram, Youtube, Linkedin } from 'lucide-react';

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

      {/* SNS */}
      <div>
        <p className="text-xs text-text-dim uppercase tracking-wider mb-3">{t('sns')}</p>
        <div className="flex gap-3">
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="p-2 border border-border-default rounded-lg hover:border-brand-mint hover:text-brand-mint transition-colors">
            <Instagram size={18} />
          </a>
          <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="p-2 border border-border-default rounded-lg hover:border-brand-mint hover:text-brand-mint transition-colors">
            <Youtube size={18} />
          </a>
          <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 border border-border-default rounded-lg hover:border-brand-mint hover:text-brand-mint transition-colors">
            <Linkedin size={18} />
          </a>
        </div>
      </div>

      {/* 지도 (구글맵 임베드) */}
      <div className="rounded-xl overflow-hidden border border-border-default aspect-video">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3163.4!2d127.056!3d37.5445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z7ISx7IiY64-Z!5e0!3m2!1sko!2skr!4v1700000000000"
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
