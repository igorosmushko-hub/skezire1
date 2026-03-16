import { getLocale } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { OrnamentDivider } from '@/components/OrnamentDivider';
import { FormTreeContainer } from '@/components/FormTreeContainer';
import { AiSection } from '@/components/AiSection';
import { AiShowcase } from '@/components/AiShowcase';
import { FamilyPortraitCta } from '@/components/FamilyPortraitCta';
import { TribeRaceSection } from '@/components/TribeRaceSection';
import '@/styles/tribe-race-section.css';

import { JsonLd } from '@/components/JsonLd';

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <>
      <JsonLd locale={locale} />
      <Hero />
      <AiShowcase />
      <TribeRaceSection locale={locale} />
      <About />
      <OrnamentDivider />
      <FormTreeContainer locale={locale} />
      <AiSection />
      <FamilyPortraitCta />
    </>
  );
}
