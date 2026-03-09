import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PlanningPub - MICE Platformer',
  description: 'MICE 산업의 새로운 패러다임, 플래닝펍이 만들어갑니다.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
