import { TRIBES_DB } from '@/data/tribes';
import type { Tribe, Zhuz } from '@/lib/types';

/** Find a tribe by ID across all zhuzs. Returns { zhuz, tribe } or null */
export function findTribe(tribeId: string): { zhuz: Zhuz; tribe: Tribe } | null {
  for (const zhuz of TRIBES_DB) {
    const tribe = zhuz.tribes.find((t) => t.id === tribeId);
    if (tribe) return { zhuz, tribe };
  }
  return null;
}

/** Check if zhuzId is valid */
export function isValidZhuz(zhuzId: string): boolean {
  return TRIBES_DB.some((z) => z.id === zhuzId);
}

/** Validate that tribeId belongs to zhuzId */
export function validateTribeBelongsToZhuz(zhuzId: string, tribeId: string): boolean {
  const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  if (!zhuz) return false;
  return zhuz.tribes.some((t) => t.id === tribeId);
}
