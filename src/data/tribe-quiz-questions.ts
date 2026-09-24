import type { TribeQuizAnswers } from '@/lib/tribe-quiz-scoring';

export type QuizQuestionType = 'select' | 'region' | 'tamga' | 'tribe-autocomplete' | 'text' | 'textarea';

export interface QuizOption {
  value: string;
  kk: string;
  ru: string;
}

export interface QuizQuestion {
  id: keyof TribeQuizAnswers;
  type: QuizQuestionType;
  title_kk: string;
  title_ru: string;
  hint_kk?: string;
  hint_ru?: string;
  placeholder_kk?: string;
  placeholder_ru?: string;
  options?: QuizOption[];
  optional?: boolean;
  visibleIf?: (a: Partial<TribeQuizAnswers>) => boolean;
}

/** 12 вопросов "Узнай свой род" — от быстрых структурированных к открытым текстовым. */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'zhuz',
    type: 'select',
    title_kk: 'Қай жүзден екеніңізді білесіз бе?',
    title_ru: 'Знаете ли вы, к какому жузу принадлежите?',
    optional: true,
    options: [
      { value: 'uly', kk: 'Ұлы жүз', ru: 'Старший жуз' },
      { value: 'orta', kk: 'Орта жүз', ru: 'Средний жуз' },
      { value: 'kishi', kk: 'Кіші жүз', ru: 'Младший жуз' },
      { value: 'other', kk: 'Жүзден тыс (Төре, Қожа, Төлеңгіт)', ru: 'Вне жузов (Торе, Кожа, Толенгит)' },
      { value: 'none', kk: 'Білмеймін', ru: 'Не знаю' },
    ],
  },
  {
    id: 'tribeGuess',
    type: 'tribe-autocomplete',
    title_kk: 'Өз руыңыздың атын білесіз бе?',
    title_ru: 'Знаете ли вы название своего рода (ру)?',
    hint_kk: 'Білсеңіз, тізімнен таңдаңыз немесе жазыңыз',
    hint_ru: 'Если знаете — выберите из списка или начните печатать',
    optional: true,
  },
  {
    id: 'regionModern',
    type: 'region',
    title_kk: 'Ата-бабаларыңыз Қазақстанның қай өңірінде тұрған?',
    title_ru: 'В каком регионе Казахстана жили ваши предки?',
    optional: true,
  },
  {
    id: 'auylFreeText',
    type: 'text',
    title_kk: 'Ата-бабаларыңыздың ауылының/жерінің атын білесіз бе?',
    title_ru: 'Знаете ли вы название аула/местности предков?',
    placeholder_kk: 'Мысалы: Шелек ауданы',
    placeholder_ru: 'Например: Шелекский район',
    optional: true,
  },
  {
    id: 'tamgaGuess',
    type: 'tamga',
    title_kk: 'Ру таңбасын есіңізде сақтадыңыз ба?',
    title_ru: 'Помните ли вы родовую тамгу (знак)?',
    hint_kk: 'Танысаңыз — таңдаңыз, көрмеген болсаңыз — өткізіп жіберіңіз',
    hint_ru: 'Если узнаёте — выберите, если нет — пропустите',
    optional: true,
  },
  {
    id: 'uranGuess',
    type: 'text',
    title_kk: 'Ру ұранын білесіз бе?',
    title_ru: 'Знаете ли вы боевой клич (ұран) своего рода?',
    placeholder_kk: 'Мысалы: Бақтыяр!',
    placeholder_ru: 'Например: Бактияр!',
    optional: true,
  },
  {
    id: 'subgroupGuess',
    type: 'select',
    title_kk: 'Кіші жүздің қай тобынан екеніңізді білесіз бе?',
    title_ru: 'Из какой подгруппы Кіші жүз вы, если знаете?',
    optional: true,
    visibleIf: (a) => a.zhuz === 'kishi' || !a.zhuz || a.zhuz === 'none',
    options: [
      { value: 'Байұлы', kk: 'Байұлы', ru: 'Байулы' },
      { value: 'Әлімұлы', kk: 'Әлімұлы', ru: 'Алимулы' },
      { value: 'Жетіру', kk: 'Жетіру', ru: 'Жетиру' },
      { value: 'none', kk: 'Білмеймін', ru: 'Не знаю' },
    ],
  },
  {
    id: 'surnameSample',
    type: 'text',
    title_kk: 'Атаңыздың тегі/әкесінің аты қалай аяқталады?',
    title_ru: 'Фамилия/отчество деда — как оканчивается?',
    placeholder_kk: 'Мысалы: Дулатов',
    placeholder_ru: 'Например: Дулатов',
    optional: true,
  },
  {
    id: 'familyLore',
    type: 'textarea',
    title_kk: 'Ата-бабаларыңыздың шыққан тегі туралы не білесіз — отбасылық әңгімелер, көші-қон?',
    title_ru: 'Что вы помните о происхождении предков — семейные предания, миграции?',
    optional: true,
  },
  {
    id: 'notablePersons',
    type: 'textarea',
    title_kk: 'Руда белгілі адамдар болды ма — батырлар, билер? Есімдерін білесіз бе?',
    title_ru: 'Были ли в роду известные люди — батыры, бии? Помните имена?',
    optional: true,
  },
  {
    id: 'familyClaim',
    type: 'text',
    title_kk: 'Үлкендерден "біз мына рудамыз" деген сөз естідіңіз бе?',
    title_ru: 'Слышали от старших, что ваш род — конкретный (например, «мы Найманы»)?',
    placeholder_kk: 'Мысалы: Найман екенбіз дейтін',
    placeholder_ru: 'Например: слышал(а), что мы Найманы',
    optional: true,
  },
  {
    id: 'additionalNotes',
    type: 'textarea',
    title_kk: 'Тегіңіз туралы тағы бірдеңе қосқыңыз келе ме?',
    title_ru: 'Хотите добавить что-то ещё о происхождении семьи?',
    optional: true,
  },
];
