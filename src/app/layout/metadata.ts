import type { Metadata } from 'next';
import { BRAND } from '@/shared/config';

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: BRAND.title,
  description: BRAND.description,
  openGraph: {
    title: BRAND.title,
    description: BRAND.description,
    siteName: BRAND.name,
    locale: 'ko_KR',
    type: 'website',
  },
};
