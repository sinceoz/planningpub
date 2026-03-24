import InviteForm from '@/components/puby/auth/InviteForm';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string; locale: string }>;
}) {
  const { token, locale } = await params;
  return <InviteForm token={token} locale={locale} />;
}
