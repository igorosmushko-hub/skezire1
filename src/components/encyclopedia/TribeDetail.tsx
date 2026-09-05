import type { Tribe } from '@/lib/types';
import { LinkedText } from '@/components/LinkedText';

interface TribeDetailTranslations {
  tamga: string;
  uran: string;
  region: string;
  subgroup: string;
  notable: string;
}

interface TribeDetailProps {
  tribe: Tribe;
  locale: string;
  zhuzName: string;
  zhuzId: string;
  labels: TribeDetailTranslations;
}

const BRANCH_NOTES: Record<string, { kk: string; ru: string }> = {
  dulat: { kk: 'Төрт атау S08 шежіре нұсқасында аталады. Жаныс каталогта жеке карточка ретінде де бар.', ru: 'Четыре названия приведены в версии шежире S08. Жаныс также есть отдельной карточкой каталога.' },
  jalayir: { kk: 'Сырманақ S06-да аталады; қалған атаулардың бір деңгейлі тікелей тармақ екені расталмаған.', ru: 'Сырманак назван в S06; остальные названия не подтверждены как прямые ветви одного уровня.' },
  alban: { kk: 'Сары атауы S07-де бар; екінші атау мен бір деңгейлі бөлінуі расталмаған.', ru: 'Название Сары есть в S07; второе название и деление на один уровень не подтверждены.' },
  argyn: { kk: 'Атаулар дәстүрлі жазбада бар, бірақ Мейрам кейбірінің арғы тегі ретінде беріледі: бұл бір деңгейлі тізім емес.', ru: 'Названия есть в традиционной записи, но Мейрам указан предком части из них: это не единый уровень.' },
  naiman: { kk: 'Тексерілген нұсқада атаулар әртүрлі деңгейде берілген; олардың бір-біріне бағыныштылығы нақтыланбаған.', ru: 'В проверенной версии названия даны на разных уровнях; их соподчинение не уточнено.' },
  kerey: { kk: 'Ашамайлы мен Абақ керей негізгі атаулар ретінде келтіріледі; Шимойынның орны нұсқаларда әртүрлі.', ru: 'Ашамайлы и Абак керей названы основными; положение Шимойына различается по версиям.' },
  kypshak: { kk: 'Кейбір атаулар S06-да бар, бірақ олардың бір деңгейлі тізім екені және Тоқа атауы расталмаған.', ru: 'Часть названий есть в S06, но единый уровень и название Тока не подтверждены.' },
  konyrat: { kk: 'S06 ұқсас атауларды келтіреді, алайда осы жазылуы мен тікелей тармақ мәртебесі расталмаған.', ru: 'S06 приводит сходные названия, но это написание и статус прямых ветвей не подтверждены.' },
  aday: { kk: 'Жеменей S11-де аталады; қалған атаулар мен олардың бір деңгейлі тізімі расталмаған.', ru: 'Жеменей назван в S11; остальные названия и их единый уровень не подтверждены.' },
  shomekei: { kk: 'Бұл екі атау негізгі тармақтар ретінде расталмаған; S09 басқа жеке желілерді ғана келтіреді.', ru: 'Эти два названия не подтверждены как основные ветви; S09 приводит другие отдельные линии.' },
};

export function TribeDetail({ tribe, locale, zhuzName, zhuzId, labels }: TribeDetailProps) {
  const isKk = locale === 'kk';

  const desc = isKk ? tribe.desc_kk : tribe.desc_ru;
  const region = isKk ? tribe.region_kk : tribe.region_ru;
  const history = isKk ? tribe.history_kk : tribe.history_ru;
  const subtribes = tribe.subtribes;
  const name = isKk ? tribe.kk : tribe.ru;
  const branchNote = BRANCH_NOTES[tribe.id];

  return (
    <article className="tribe-article-card">
      {/* Dark hero header */}
      <div className="tribe-card-hero">
        <div className="tribe-card-tamga-icon">{tribe.tamga}</div>
        <div className="tribe-card-hero-text">
          <h1 className="tribe-card-name">{name}</h1>
          {tribe.uran && (
            <p className="tribe-card-uran">&ldquo;{tribe.uran}&rdquo;</p>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="tribe-card-meta-row">
        <div className="tribe-card-meta-item">
          <span className="tribe-card-meta-label">{isKk ? 'ЖҮЗ' : 'ЖУЗ'}</span>
          <span className="tribe-card-meta-value">{zhuzName}</span>
        </div>
        {region && (
          <div className="tribe-card-meta-item">
            <span className="tribe-card-meta-label">{labels.region.toUpperCase()}</span>
            <span className="tribe-card-meta-value">{region}</span>
          </div>
        )}
        {tribe.tamga && (
          <div className="tribe-card-meta-item">
            <span className="tribe-card-meta-label">{labels.tamga.toUpperCase()}</span>
            <span className="tribe-card-meta-value tamga-big">{tribe.tamga}</span>
          </div>
        )}
      </div>
      {tribe.tamga && (
        <p className="tribe-card-desc" style={{ margin: '0 24px' }}>
          {isKk ? 'Каталогтың шартты белгісі; тамғаның тарихи бейнесі емес.' : 'Условное обозначение каталога; не историческое изображение тамги.'}
        </p>
      )}

      {/* Description */}
      <div className="tribe-card-section">
        <LinkedText text={desc} locale={locale} className="tribe-card-desc" selfPath={`/encyclopedia/${zhuzId}/${tribe.id}`} />
      </div>

      {/* History */}
      {history && (
        <div className="tribe-card-section">
          <h3 className="tribe-card-section-title">{isKk ? 'Тарихы' : 'История'}</h3>
          <LinkedText text={history} locale={locale} className="tribe-card-desc" selfPath={`/encyclopedia/${zhuzId}/${tribe.id}`} />
        </div>
      )}

      {/* Subtribes */}
      {subtribes && subtribes.length > 0 && (
        <div className="tribe-card-section">
          <h3 className="tribe-card-section-title">{isKk ? 'Тармақ атаулары' : 'Названия ветвей'}</h3>
          {branchNote && <p className="tribe-card-desc">{isKk ? branchNote.kk : branchNote.ru}</p>}
          <div className="tribe-card-subtribes">
            {subtribes.map((st) => (
              <span key={st.kk} className="tribe-subtribe-tag">
                {isKk ? st.kk : st.ru}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notable people */}
      {tribe.notable.length > 0 && (
        <div className="tribe-card-section tribe-card-section--last">
          <h3 className="tribe-card-section-title">{labels.notable}</h3>
          <div className="tribe-card-notable-list">
            {tribe.notable.map((p) => (
              <div key={p.name} className="tribe-card-notable-item">
                <span className="tribe-card-notable-star">★</span>
                <div>
                  <span className="tribe-card-notable-name">{p.name}</span>
                  <span className="tribe-card-notable-role"> — {isKk ? p.role_kk : p.role_ru}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
