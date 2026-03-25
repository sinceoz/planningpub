'use client';

// Using next/navigation intentionally — need the raw pathname with locale prefix
// to detect /puby routes regardless of locale (e.g., /ko/puby, /en/puby)
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isPuby = pathname.includes('/puby');

  if (isPuby) return null;

  return <Navbar />;
}
