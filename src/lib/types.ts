export interface NotablePerson {
  name: string;
  role_kk: string;
  role_ru: string;
}

export interface SubTribe {
  children?: SubTribe[];
  note?: { kk: string; ru: string };
  aliases?: string[];
  id: string;
  kk: string;
  ru: string;
}

export interface Tribe {
  id: string;
  kk: string;
  ru: string;
  desc_kk: string;
  desc_ru: string;
  region_kk: string;
  region_ru: string;
  tamga: string;
  uran: string;
  subgroup_kk?: string;
  subgroup_ru?: string;
  notable: NotablePerson[];
  subtribes?: SubTribe[];
  history_kk?: string;
  history_ru?: string;
  relatedTribes?: string[];
  historyTitle?: { kk: string; ru: string };
  branchNote?: { kk: string; ru: string };
  branchTitle?: { kk: string; ru: string };
  updatedAt?: string;
  sources?: {
    title: string;
    url: string;
    locator_kk: string;
    locator_ru: string;
  }[];
}

export interface Zhuz {
  id: string;
  kk: string;
  ru: string;
  desc_kk: string;
  desc_ru: string;
  tribes: Tribe[];
}

export interface AncestorDef {
  kaz: string;
  label: string;
}

export interface AncestorNode {
  kaz: string;
  label: string;
  name: string;
  isUser?: boolean;
}

export interface TreeFormData {
  name: string;
  birthYear: string;
  zhuz: string;
  zhuzLabel: string;
  ru: string;
  ancestors: AncestorNode[];
  photoBase64: string;
  gender: 'male' | 'female';
}
