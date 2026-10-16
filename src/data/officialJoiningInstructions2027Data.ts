export interface SchoolFeeItem {
  id: string;
  itemNumber?: number;
  name: string;
  amount: number;
  note?: string;
}

export interface OfficialJoiningInstructions2027 {
  title: string;
  year: number;
  reportingDate: string;
  schoolName: string;
  diocese: string;
  poBox: string;
  locationHeader: string;
  contacts: {
    headmaster: string;
    deputyHeadmaster: string;
    bursar: string;
  };
  locationDescription: string;
  directions: string;
  boardingFees: {
    termOne: number;
    termTwo: number;
    total: number;
  };
  schoolProvidedItems: SchoolFeeItem[];
  schoolProvidedItemsTotal: number;
  grandTotalBoarding: number;
  bankAccounts: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }[];
  paymentInstructions: string[];
  parentProvidedBoardingItems: {
    id: string;
    item: string;
    specification: string;
    forWhom: 'all' | 'girls' | 'boys';
  }[];
  importantNotes: string[];
  welcomeMessage: string;
  headmasterTitle: string;
}

export const OFFICIAL_JOINING_INSTRUCTIONS_2027: OfficialJoiningInstructions2027 = {
  title: 'YAH: FOMU YA KUJIUNGA NA SHULE 2027',
  year: 2027,
  reportingDate: '07/01/2027',
  schoolName: 'SHULE YA SEKONDARI UOMBONI',
  diocese: 'JIMBO KATOLIKI MOSHI',
  poBox: 'S.L.P 361, MARANGU - KILIMANJARO',
  locationHeader: 'MARANGU- KILIMANJARO',
  contacts: {
    headmaster: '0782 558 127',
    deputyHeadmaster: '0752 717 191 / 0785 402 452',
    bursar: '0752 000 939',
  },
  locationDescription: 'Shule ipo Mkoani Kilimanjaro, Wilaya ya Moshi Vijijini, Kata ya Marangu-Magharibi, Kijiji cha Kiraracha, ipo karibu na Parokia ya Bikira Maria Malkia wa Rozari Takatifu - Uomboni.',
  directions: 'Ukifika Moshi Mjini au Njia Panda (Himo); panda magari yanayoenda Marangu Kilema, shuka barabara iendayo Makomu, fuata barabara hiyo moja kwa moja utafika shule ya Sekondari Uomboni au panda gari la kutoka (Moshi - Marangu kiraracha).',
  boardingFees: {
    termOne: 800000,
    termTwo: 800000,
    total: 1600000,
  },
  schoolProvidedItems: [
    { id: 'item-1', itemNumber: 1, name: 'Suruali 2 / sketi 2 na shati 2', amount: 70000 },
    { id: 'item-2', itemNumber: 2, name: 'T-shirt moja', amount: 15000 },
    { id: 'item-3', itemNumber: 3, name: 'Sweta moja', amount: 15000 },
    { id: 'item-4', itemNumber: 4, name: 'Kitambulisho', amount: 6000 },
    { id: 'item-5', itemNumber: 5, name: 'Nembo', amount: 5000 },
    { id: 'item-6', itemNumber: 6, name: 'Afya', amount: 25000 },
    { id: 'item-7', itemNumber: 7, name: 'Track suit', amount: 23000 },
    { id: 'item-8', itemNumber: 8, name: 'Ndoo, sahani, kijiko, kikombe', amount: 10000 },
    { id: 'item-9', itemNumber: 9, name: 'Godoro 2 ½ × 3 × 6', amount: 55000 },
  ],
  schoolProvidedItemsTotal: 224000,
  grandTotalBoarding: 1824000,
  bankAccounts: [
    {
      bankName: 'CRDB Bank',
      accountNumber: '01J1079051400',
      accountName: 'UOMBONI SECONDARY SCHOOL',
    },
    {
      bankName: 'NMB Bank',
      accountNumber: '40302507439',
      accountName: 'UOMBONI SECONDARY SCHOOL',
    },
    {
      bankName: 'MKOMBOZI COMMERCIAL BANK',
      accountNumber: '0051150397901',
      accountName: 'UOMBONI SECONDARY SCHOOL',
    },
  ],
  paymentInstructions: [
    'Malipo hayo yote yalipwe kupitia bank account: Na 01J1079051400 CRDB, 40302507439 NMB, na 0051150397901 MKOMBOZI.',
    'Mwanafunzi aje na "pay-in-slip" yenye majina matatu na kidato anachosoma.',
    'Hatupokei fedha taslimu shuleni.',
    'Fedha za kujikimu (pocket money) zikabidhiwe kwa mhasibu wa shule siku ya kuripoti shuleni.',
  ],
  parentProvidedBoardingItems: [
    {
      id: 'p-01',
      item: 'Viatu jozi mbili (02)',
      specification: 'Rangi nyeusi na viwe vya kufunga kwa kamba',
      forWhom: 'all',
    },
    {
      id: 'p-02',
      item: 'Soksi jozi mbili (02)',
      specification: 'Ndefu na ziwe nyeupe (wasichana)',
      forWhom: 'girls',
    },
    {
      id: 'p-03',
      item: 'Shuka mbili (2) & Blanket zito moja (1)',
      specification: 'Rangi ya pink / blue bahari (shuka za shule) pamoja na blanket zito moja (1)',
      forWhom: 'all',
    },
    {
      id: 'p-04',
      item: 'Mto mmoja (01) na foronya mbili (02)',
      specification: 'Zinazofanana na rangi ya shuka',
      forWhom: 'all',
    },
    {
      id: 'p-05',
      item: 'Taulo moja (01)',
      specification: 'Taulo safi ya kuogea',
      forWhom: 'all',
    },
    {
      id: 'p-06',
      item: 'Kanga au kitenge pea moja tu',
      specification: 'Pea moja tu kwa wasichana kwa matumizi ya bweni',
      forWhom: 'girls',
    },
    {
      id: 'p-07',
      item: 'Nguo za michezo (Wasichana)',
      specification: 'Raba, T-shirt za blue na sketi nyeusi (kwa wasichana)',
      forWhom: 'girls',
    },
    {
      id: 'p-08',
      item: 'Nguo za michezo (Wavulana)',
      specification: 'T-shirt na bukta kwa wavulana za michezo (blue)',
      forWhom: 'boys',
    },
    {
      id: 'p-09',
      item: 'Sanduku la bati (tranka)',
      specification: 'Pamoja na kufuli lake imara na funguo',
      forWhom: 'all',
    },
    {
      id: 'p-10',
      item: 'Mavazi ya ndani',
      specification: 'Mavazi ya ndani ya kutosha kwa wote',
      forWhom: 'all',
    },
    {
      id: 'p-11',
      item: 'Daftari za kutosha (counter book 12)',
      specification: 'Daftari 12 za counter book (zinapatikana pia shuleni)',
      forWhom: 'all',
    },
    {
      id: 'p-12',
      item: 'Jembe na ufagio mmoja',
      specification: 'Kwa ajili ya shughuli za usafi wa mazingira',
      forWhom: 'all',
    },
    {
      id: 'p-13',
      item: 'Kamusi ya Kiingereza',
      specification: 'Kamusi ya Kiingereza aje nayo',
      forWhom: 'all',
    },
    {
      id: 'p-14',
      item: 'Vitabu, Biblia / Kurani',
      specification: 'Mzazi unaweza kumnunulia mwanao vitabu, biblia / kurani (hivyo ni vyake mwenyewe)',
      forWhom: 'all',
    },
  ],
  importantNotes: [
    'Mwanao aje na Rimu ya A4 (Isiyo na mistari) kwa ajili ya mazoezi na mitihani ya kila wiki na mwisho wa mwezi.',
    'Nguo na vifaa vyote vya mwanafunzi ziandikwe majina yake matatu.',
    'Tafadhali soma kwa makini maelezo/maagizo haya na kuyatekeleza kikamilifu.',
  ],
  welcomeMessage: 'Mwisho ninawakaribisha sana shule ya Sekondari Uomboni',
  headmasterTitle: 'Mkuu wa Shule',
};
