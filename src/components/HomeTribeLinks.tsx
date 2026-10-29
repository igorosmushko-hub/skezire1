import { TRIBES_DB } from '@/data/tribes';
import { tribeHeading } from '@/lib/encyclopedia-seo';

// Server-rendered block of plain links from the home page to the main tribe cards.
const FEATURED: { zhuzId: string; tribeIds: string[] }[] = [
  { zhuzId: 'orta', tribeIds: ['argyn', 'kerey', 'naiman', 'kypshak', 'konyrat', 'uak'] },
  { zhuzId: 'uly', tribeIds: ['dulat', 'alban', 'jalayir', 'shapyrashty'] },
  { zhuzId: 'kishi', tribeIds: ['aday', 'tabyn'] },
];

const TRIBE_TOTAL = TRIBES_DB.reduce((sum, zhuz) => sum + zhuz.tribes.length, 0);

export function HomeTribeLinks({ locale }: { locale: string }) {
  const isKk = locale === 'kk';

  const groups = FEATURED.map(({ zhuzId, tribeIds }) => {
    const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
    if (!zhuz) throw new Error(`HomeTribeLinks: unknown zhuz "${zhuzId}"`);
    const tribes = tribeIds.map((tribeId) => {
      const tribe = zhuz.tribes.find((t) => t.id === tribeId);
      if (!tribe) throw new Error(`HomeTribeLinks: unknown tribe "${zhuzId}/${tribeId}"`);
      return tribe;
    });
    return { zhuz, tribes };
  });

  return (
    <section className="home-tribes" aria-labelledby="home-tribes-title">
      <div className="container">
        <h2 id="home-tribes-title">{isKk ? 'Қазақ рулары' : 'Казахские роды'}</h2>
        <div className="home-tribes-groups">
          {groups.map(({ zhuz, tribes }) => (
            <div key={zhuz.id} className="home-tribes-group">
              <h3>{isKk ? zhuz.kk : zhuz.ru}</h3>
              <ul className="home-tribes-grid">
                {tribes.map((tribe) => (
                  <li key={tribe.id}>
                    <a href={`/${locale}/encyclopedia/${zhuz.id}/${tribe.id}`}>
                      {tribeHeading(isKk ? tribe.kk : tribe.ru, zhuz.id, isKk)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="home-tribes-all">
          <a href={`/${locale}/encyclopedia`}>
            {isKk ? `Барлық ${TRIBE_TOTAL} ру` : `Все ${TRIBE_TOTAL} родов`}
          </a>
        </p>
      </div>
    </section>
  );
}
