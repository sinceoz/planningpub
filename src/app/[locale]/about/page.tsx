import type { Metadata } from 'next';
import CompanyIntro from '@/components/about/CompanyIntro';

export const metadata: Metadata = {
  title: '회사 소개 - About Us',
  description:
    '플래닝펍은 MICE 산업의 디지털 전환을 선도합니다. 아시아 No.1 MICE Platform Company를 목표로, 행사를 플랫폼으로 재설계합니다.',
  openGraph: {
    title: 'PlanningPub - 회사 소개',
    description: 'MICE 산업의 디지털 전환을 선도하는 플래닝펍을 소개합니다.',
  },
};
import CertificationGrid from '@/components/about/CertificationGrid';

export default function AboutPage() {
  return (
    <>
      <CompanyIntro />
      <CertificationGrid />
    </>
  );
}
