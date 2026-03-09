import HeroSection from '@/components/home/HeroSection';
import MicePlatformerSection from '@/components/home/MicePlatformerSection';
import ServiceGrid from '@/components/home/ServiceGrid';
import PortfolioPreview from '@/components/home/PortfolioPreview';
import CTASection from '@/components/home/CTASection';

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
