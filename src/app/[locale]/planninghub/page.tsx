import type { Metadata } from 'next';
import PHHero from '@/components/planninghub/PHHero';

export const metadata: Metadata = {
  title: 'PlanningHUB - All-in-One MICE Platform',
  description:
    'MICE 기획자를 위한 올인원 플랫폼. AI 기반 행사 기획(OneShotPlan), 입찰정보, 행사장 검색, 협력업체 네트워크, 참가자 관리, AI 견적까지.',
  openGraph: {
    title: 'PlanningHUB - All-in-One MICE Platform',
    description: 'MICE 기획자를 위한 올인원 플랫폼. AI 기반 행사 기획부터 참가자 관리까지.',
  },
};
import PHFeatureGrid from '@/components/planninghub/PHFeatureGrid';
import PHCTASection from '@/components/planninghub/PHCTASection';

export default function PlanningHUBPage() {
  return (
    <>
      <PHHero />
      <PHFeatureGrid />
      <PHCTASection />
    </>
  );
}
