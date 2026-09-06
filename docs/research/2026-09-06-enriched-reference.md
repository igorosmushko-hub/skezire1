# Enriched reference catalogue: source manifest

**Content snapshot:** 6 September 2026. This is a source-authored reference catalogue for six existing Ұлы жүз cards: Дулат, Жалайыр, Шапырашты, Сіргелі, Албан and Суан. Its nested links mean membership in the cited editorial version. They do not assert biological parentage.

## Actual catalogue delta

The comparison point is `fd29cf3:src/data/tribes.ts`. It contained 47 tribe cards and 42 branch nodes when counted recursively. The current file retains 47 tribe cards and has 78 branch nodes: 40 added IDs, 4 removed IDs, for a net increase of 36.

| Area | Source-authored result | Added IDs | Removed IDs |
|---|---|---|---|
| Дулат | Ботбай gains four source labels; the other three listed branches remain | `dulat-kudaykul`, `dulat-shagay`, `dulat-koralas`, `dulat-buydas` | — |
| Жалайыр | Full 2008 version: three departments and 14 groups | `jalayir-bayshegir`, `jalayir-kayshyly`, `jalayir-balgaly`, `jalayir-aryktynym`, `jalayir-kushik`, `jalayir-shumanak`, `jalayir-myrza`, `jalayir-karashapan`, `jalayir-orakty`, `jalayir-akbuym`, `jalayir-kalpe`, `jalayir-sypatay`, `jalayir-birmanak`, `jalayir-siyrshy`, `jalayir-karakalpak` | `jalayir-oiyk`, `jalayir-argynat` |
| Шапырашты | Separate source-membership topology | `shapyrashty-asyl`, `shapyrashty-shybyl`, `shapyrashty-ekey`, `shapyrashty-zharimbet`, `shapyrashty-emil`, `shapyrashty-eskozha`, `shapyrashty-aykym` | — |
| Сіргелі | Complete published list of 12 source labels | `sirgeli-bayzhigit`, `sirgeli-shaldar`, `sirgeli-aytbozym`, `sirgeli-karabatyr`, `sirgeli-batyr`, `sirgeli-zhaydak`, `sirgeli-zhanabay`, `sirgeli-elibay`, `sirgeli-tutanbaly`, `sirgeli-koyshyly`, `sirgeli-karakonirdek`, `sirgeli-akkonirdek` | — |
| Албан | One directly attested branch replaces two unsupported nodes | `alban-shybyl` | `alban-sary`, `alban-kara` |
| Суан | One directly attested branch | `suan-tokarystan` | — |

All other 41 tribe cards and their existing branch content are unchanged by this enrichment. Their retained branches have not thereby received a new source verification.

## Editorial trees and source labels

### Дулат

`Дулат → Ботбай → Құдайқұл, Шағай, Қоралас, Бұйдас`; and `Дулат → Жаныс, Сиқым, Шымыр`.

The labels are taken as a complete list from the Auezov Institute glossary. `Бұйдас` is source-only in this catalogue: it is a published group label, not a claim to identify any similarly named or compound entry in an upstream genealogy.

### Жалайыр — authors' 2008 version

The authors explicitly select this version after comparing conflicting шежіре material (printed pp. 134–139). Their full table on p. 139 is retained rather than a partial pilot list:

```
Жалайыр
├── Шуманақ: Андас, Мырза, Қарашапан, Орақты, Ақбұйым, Қалпе, Сыпатай
├── Сырманақ: Арықтыным, Байшегір, Балғалы, Қайшылы, Күшік
└── Бірманақ: Сиыршы, Қарақалпақ
```

`Арықтыным`, `Күшік` and `Сиыршы` are plain source group labels. They are intentionally included without treating compound upstream labels as the same entities. Printed p. 213 independently describes `Балғалы` as one of the five groups in Сырманақ and explains that it is a byname associated with Қосар; the catalogue label remains `Балғалы`. `Қарақалпақ` denotes the group inside this Жалайыр version, not the Karakalpak people as a whole.

### Шапырашты — separate membership topology

```
Шапырашты
├── Асыл
├── Шыбыл
├── Екей
│   └── Жәрімбет
├── Еміл
├── Есқожа
└── Айқым
```

The glossary names the six direct groups and places `Жәрімбет` in `Екей`. This is an editorial source tree, kept separate from the stored Tumalas paths. It does not silently reparent any upstream record. `Шыбыл` here and `Албан → Шыбыл` are distinct same-named branches.

### Сіргелі, Албан and Суан

The Qazaqtanu source supplies the 12 labels shown above. It prints `Бай жігіт`, normalized in the catalogue as `Байжігіт`. Its punctuation omits a comma between `Жайдақ` and `Жаңабай`; they are presented separately because the same list states 12 groups. The catalogue preserves the source labels `Тутаңбалы` and `Қойшылы`; it does not equate them with similarly sounding upstream spellings.

`Албан → Шыбыл` is the only link taken from the 2025 study: the adjacent account of Сары and his sons is not converted into group nodes. `Суан → Тоқарыстан` is the single attested fragment; the remaining Suan composition is not reconstructed.

## Sources and preserved evidence

The research snapshot date is `2026-08-20T10:22:34.108Z`; its structural and source checks were performed on 6 September 2026. Hashes identify the locally retained source artifacts. The raw-path dossier stays in the private handoff and is not included in this public release.

| Source | Locator used here | SHA-256 |
|---|---|---|
| [Auezov Institute, «Ру атаулары»](https://auezovinstitute.kz/?page_id=9125) | Entries Дулат, Ботбай, Екей, Шапырашты, Тоқарыстан | `e7a343d1cce87eeb1001baf31702175104a1dc6afea2cafaf4257c42f709f194` |
| [«Қазақстан тарихы этникалық зерттеулерде», vol. III: Жалайыр (2008)](https://adebiportal.kz/upload/iblock/43e/43e7c1d9d071039c6ca1201625284e8f.pdf#page=139) | Printed pp. 134–139; p. 213 for Балғалы | `1fd7120fa1467898cf06a2438f451e353ff585cb4f04eb0f8105251012d974e0` |
| [Qazaqtanu, no. III (2019)](https://auezov.edu.kz/images/files/%D0%86%D0%86%D0%86%20%D0%BD%D0%BE%D0%BC%D0%B5%D1%80%20%C2%ABQAZAQTAN%C3%9D%C2%BB%2019_04_2019.pdf#page=120) | Printed p. 119 / PDF p. 120; reproduced National Encyclopedia vol. 8, p. 153 | `f9cc54fe60e418f79f14b2aeb1c1f9ce6e93a648aed3e4232a457222dc9d8255` |
| [«XVIII ғ.–XX ғ. басындағы қазақ батырлары» (2025)](https://iie.kz/wp-content/uploads/2026/05/%D0%91%D0%90%D0%A2%D0%AB%D0%A0%D0%AB-%D0%9F%D0%95%D0%A7%D0%90%D0%A2%D0%AC.pdf#page=165) | Printed/PDF p. 165: Албан → Шыбыл | `0345cd7be69ef43f63388882686b3278afb3f55aa8e740b8bc4c7f3849db65e8` |

## Relation to the earlier Tumalas proposal

The locally retained `2026-09-06-tumalas-map` dossier remains a historical research proposal: 45 selected raw-path nodes including the navigation root, with a separate decision for each exact upstream path. This release intentionally differs. It is an editorial catalogue of published group labels, so it includes source-only labels such as Бұйдас, Арықтыным, Күшік, Сиыршы, Тутаңбалы and Қойшылы, while keeping unverified upstream identity and path questions outside the catalogue.
