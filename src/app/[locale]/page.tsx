import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import MicePlatformerSection from '@/components/home/MicePlatformerSection';
import ServiceGrid from '@/components/home/ServiceGrid';
import PortfolioPreview from '@/components/home/PortfolioPreview';
import CTASection from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'PlanningPub - MICE Platformer | 행사를 플랫폼으로',
  description:
    '대행사가 바뀌어도, 담당자가 바뀌어도 행사는 축적됩니다. 플래닝펍은 기획자의 노하우와 개발자의 기술로 지속 성장하는 MICE 플랫폼을 설계합니다.',
  alternates: {
    canonical: 'https://planningpub.com',
    languages: { ko: '/ko', en: '/en' },
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MicePlatformerSection />
      <ServiceGrid />
      <PortfolioPreview />
      <CTASection />
    </>
  );
}
