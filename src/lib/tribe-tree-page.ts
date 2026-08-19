import type { Tribe, Zhuz } from './types';
import type { TribeTreeNode } from './tribe-tree';

function tribeNode(tribe: Tribe, zhuz: Zhuz, locale: string): TribeTreeNode {
  const isKk = locale === 'kk';
  return {
    id: `tribe:${tribe.id}`,
    name: isKk ? tribe.kk : tribe.ru,
    secondaryName: isKk ? tribe.ru : tribe.kk,
    kind: 'tribe',
    href: `/${locale}/encyclopedia/${zhuz.id}/${tribe.id}`,
    tamga: tribe.tamga,
    summary: isKk ? tribe.desc_kk : tribe.desc_ru,
    children: tribe.subtribes?.map((subtribe) => ({
      id: `subtribe:${subtribe.id}`,
      name: isKk ? subtribe.kk : subtribe.ru,
      secondaryName: isKk ? subtribe.ru : subtribe.kk,
      kind: 'subtribe' as const,
    })),
  };
}

export function buildTribeTree(locale: string, data: Zhuz[]): TribeTreeNode {
  const isKk = locale === 'kk';
  return {
    id: 'alash',
    name: 'Алаш',
    kind: 'root',
    summary: isKk
      ? 'Қазақ руларының интерактивті картасының бастапқы түйіні.'
      : 'Начальная точка интерактивной карты казахских родов.',
    children: data.map((zhuz) => {
      const ordinaryChildren = zhuz.tribes.map((tribe) => tribeNode(tribe, zhuz, locale));
      const subgroupMap = new Map<string, { kk: string; ru: string; tribes: Tribe[] }>();
      for (const tribe of zhuz.tribes) {
        if (!tribe.subgroup_kk || !tribe.subgroup_ru) continue;
        const subgroup = subgroupMap.get(tribe.subgroup_kk) ?? {
          kk: tribe.subgroup_kk,
          ru: tribe.subgroup_ru,
          tribes: [],
        };
        subgroup.tribes.push(tribe);
        subgroupMap.set(tribe.subgroup_kk, subgroup);
      }
      const children = zhuz.id === 'kishi' && subgroupMap.size
        ? [...subgroupMap.values()].map((subgroup) => ({
            id: `subgroup:${subgroup.kk}`,
            name: isKk ? subgroup.kk : subgroup.ru,
            secondaryName: isKk ? subgroup.ru : subgroup.kk,
            kind: 'subgroup' as const,
            children: subgroup.tribes.map((tribe) => tribeNode(tribe, zhuz, locale)),
          }))
        : ordinaryChildren;

      return {
        id: `zhuz:${zhuz.id}`,
        name: isKk ? zhuz.kk : zhuz.ru,
        secondaryName: isKk ? zhuz.ru : zhuz.kk,
        kind: 'zhuz' as const,
        href: `/${locale}/encyclopedia/${zhuz.id}`,
        summary: isKk ? zhuz.desc_kk : zhuz.desc_ru,
        children,
      };
    }),
  };
}
