import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';

export const metadata: Metadata = {
  title: '프로젝트 문의 - Contact',
  description:
    'MICE 행사 기획 문의. 컨벤션, 전시회, 컨퍼런스, 페스티벌, 온라인 행사 등 프로젝트에 대해 상담해 드립니다. 24시간 내 회신.',
  openGraph: {
    title: 'PlanningPub 프로젝트 문의',
    description: 'MICE 행사 기획 상담. 24시간 내 회신드립니다.',
  },
};
import SectionLabel from '@/components/ui/SectionLabel';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>{t('label')}</SectionLabel>
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mt-4">
          {t('title')}
        </h1>
        <p className="text-text-muted mt-3 mb-12 max-w-xl">
          {t('subtitle')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
          <div className="lg:col-span-2">
            <ContactInfo />
          </div>
        </div>
      </div>
    </section>
  );
}
