import { redirect } from 'next/navigation';

export default async function JoinTribePage({
  params,
}: {
  params: Promise<{ locale: string; tribeId: string }>;
}) {
  const { locale, tribeId } = await params;
  // Redirect to the tree page with the tribe highlighted
  redirect(`/${locale}/shezhire-tree?highlight=${tribeId}`);
}
