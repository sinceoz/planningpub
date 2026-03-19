import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Noto_Sans_KR } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingContact from '@/components/floating/FloatingContact';

const notoSansKr = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ko' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="e9f9142824e9dd06e861cc7c8fc5e0787bf4350d" />
        <meta name="google-site-verification" content="shev-hZNlJgxz4GZwIIjCPhPG90gtAA_PEc8N1kzZcY" />
        {/* Pretendard CDN */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Instrument Serif (Google Fonts) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'PlanningPub',
              alternateName: '(주)플래닝펍',
              url: 'https://planningpub.com',
              logo: 'https://planningpub.com/icon.png',
              description:
                'MICE 산업의 디지털 전환을 이끄는 행사 기획 전문 플랫폼',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '서초대로 131 로고스빌딩 6층',
                addressLocality: '서초구',
                addressRegion: '서울',
                addressCountry: 'KR',
              },
              telephone: '+82-2-2066-8528',
              email: 'info@planningpub.com',
              sameAs: [
                'https://www.instagram.com/planningpub',
                'https://www.youtube.com/@planningpub',
                'https://www.linkedin.com/company/planningpub',
                'https://blog.naver.com/planningpub',
              ],
              serviceType: [
                'Convention',
                'Exhibition',
                'Conference',
                'Festival',
                'Online Event',
                'Metaverse Event',
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${notoSansKr.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-[calc(100vh-160px)]">
            {children}
          </main>
          <Footer />
          <FloatingContact />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
