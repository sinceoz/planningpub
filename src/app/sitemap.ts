import type { MetadataRoute } from 'next';

const BASE_URL = 'https://planningpub.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['ko', 'en'];
  const routes = ['', '/about', '/portfolio', '/contact', '/planninghub'];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
  );
}
