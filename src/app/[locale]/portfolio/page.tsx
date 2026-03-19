import type { Metadata } from 'next';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';

export const metadata: Metadata = {
  title: '포트폴리오 - Portfolio',
  description:
    '플래닝펍이 기획한 45건 이상의 프로젝트, 40개국 글로벌 이벤트, 100만 명 이상의 참가자. 컨벤션, 전시회, 컨퍼런스, 페스티벌 포트폴리오를 확인하세요.',
  openGraph: {
    title: 'PlanningPub 포트폴리오',
    description: '45+ 프로젝트, 40개국 글로벌 이벤트 포트폴리오.',
  },
};

export default function PortfolioPage() {
  return <PortfolioGrid />;
}
