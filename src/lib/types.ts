export interface NotablePerson {
  name: string;
  role_kk: string;
  role_ru: string;
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
}
