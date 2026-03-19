import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://planningpub.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'PlanningPub - MICE Platformer | 행사 기획 전문 플랫폼',
    template: '%s | PlanningPub',
  },
  description:
    'MICE 산업의 디지털 전환을 이끄는 플래닝펍. 컨벤션, 전시회, 컨퍼런스, 페스티벌 등 행사 기획부터 운영까지 올인원 플랫폼 서비스를 제공합니다.',
  keywords: [
    'MICE', 'MICE 기획', '행사 기획', '컨벤션', '전시회', '컨퍼런스',
    '페스티벌', '이벤트 대행', '온라인 행사', '메타버스 이벤트',
    'PlanningPub', '플래닝펍', 'PlanningHUB', '행사 플랫폼',
  ],
  authors: [{ name: 'PlanningPub', url: BASE_URL }],
  creator: 'PlanningPub',
  publisher: 'PlanningPub',
  formatDetection: { telephone: true, email: true },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
    siteName: 'PlanningPub',
    title: 'PlanningPub - MICE Platformer | 행사 기획 전문 플랫폼',
    description:
      'MICE 산업의 디지털 전환을 이끄는 플래닝펍. 컨벤션, 전시회, 컨퍼런스, 페스티벌 등 행사 기획부터 운영까지.',
    url: BASE_URL,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PlanningPub - MICE Platformer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlanningPub - MICE Platformer',
    description:
      'MICE 산업의 디지털 전환을 이끄는 플래닝펍. 행사 기획부터 운영까지 올인원 플랫폼.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'ko': `${BASE_URL}/ko`,
      'en': `${BASE_URL}/en`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
