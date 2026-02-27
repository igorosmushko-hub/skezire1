import { getLocale } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { OrnamentDivider } from '@/components/OrnamentDivider';
import { FormTreeContainer } from '@/components/FormTreeContainer';
import { AiSection } from '@/components/AiSection';
import { JsonLd } from '@/components/JsonLd';

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <>
      <JsonLd locale={locale} />
      <Hero />
      <About />
      <OrnamentDivider />
      <FormTreeContainer locale={locale} />
      <AiSection />
    </>
  );
}
