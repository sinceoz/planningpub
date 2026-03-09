import { useTranslations } from 'next-intl';
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
