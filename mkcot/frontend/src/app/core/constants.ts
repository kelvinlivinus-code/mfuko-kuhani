/** Orodha na lebo zinazotumika kwenye mfumo mzima (sawa na toleo la awali). */
export const COLS = ['members', 'payments', 'events', 'loans', 'projects', 'cabinet', 'meetings', 'notices', 'ledger'] as const;
export type Col = (typeof COLS)[number];

export const FUND_FULL = 'Mfuko wa Kuhani wa Operation and Training';
export const DEF_SETTINGS = {
  fundName: 'MKCOT',
  branch: 'Tawi la COT (Chief of Operations and Training), JWTZ',
  entryFee: 35000,
  monthlyFee: 10000,
  interestRate: 0,
  openingBalance: 0,
  openingDate: '',
  hasLogo: false,
  logoVersion: 0,
};
export const MONTHS = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'];
export const MONTHS_FULL = ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'];
export const STATUS = ['Hai', 'Amesimamishwa', 'Amehama', 'Amefariki'];
export const RELATIONS = ['Mke', 'Mume', 'Mtoto', 'Baba', 'Mama', 'Baba mkwe', 'Mama mkwe', 'Ndugu mwingine'];
export const EV_KINDS = ['Msiba', 'Ugonjwa', 'Ajali', 'Harusi / Sherehe', 'Changamoto nyingine'];
export const EV_REL = ['Mwanachama mwenyewe', 'Mtoto', 'Mke', 'Mume', 'Baba', 'Mama', 'Baba mkwe', 'Mama mkwe', 'Ndugu mwingine'];
export const PAY_TYPES: Record<string, string> = {
  mwezi: 'Mchango wa mwezi',
  kiingilio: 'Ada ya kiingilio',
  maalum: 'Mchango maalum',
  faini: 'Faini',
  nyingine: 'Malipo mengine',
};
export const POSITIONS = ['Mlezi', 'Mwenyekiti', 'Makamu Mwenyekiti', 'Katibu', 'Katibu Msaidizi', 'Mweka Hazina', 'Mweka Hazina Msaidizi', 'Mjumbe'];
export const MEET_KINDS = ['Kikao cha kawaida', 'Kikao cha dharura', 'Mkutano mkuu', 'Kikao cha kamati ya uongozi'];
export const PROJ_STATUS = ['Wazo', 'Inaendelea', 'Imekamilika', 'Imesitishwa'];

export const ROLE_LBL: Record<string, string> = {
  msimamizi: 'Msimamizi',
  msomaji: 'Mkaguzi',
  mhazini: 'Mhazini',
  malipo: 'Mweka malipo',
  katibu: 'Katibu',
  mwanachama: 'Mwanachama',
  anasubiri: 'Anasubiri kuidhinishwa',
};
export const ROLES = ['anasubiri', 'mwanachama', 'malipo', 'katibu', 'mhazini', 'msomaji', 'msimamizi'];
export const ROLE_HELP: [string, string][] = [
  ['Mwanachama', 'anaona taarifa zake binafsi tu: michango, mikopo na matukio yake, pamoja na matangazo.'],
  ['Mweka malipo', 'anarekodi michango na malipo tu.'],
  ['Katibu', 'anasajili wanachama, anarekodi matukio ya kuhaniwa, vikao, uongozi na matangazo.'],
  ['Mhazini', 'anashughulikia malipo, mikopo, miradi na hesabu za mfuko.'],
  ['Mkaguzi', 'anaona taarifa zote lakini hawezi kubadilisha chochote.'],
  ['Msimamizi', 'anafanya yote, pamoja na kuidhinisha watumiaji na kubadilisha mipangilio.'],
];

/** Ruhusa za kila nafasi: zinalingana na ukaguzi wa backend (Permissions.java). */
export const PERM: Record<string, { views: string[] | '*'; write: string[] | '*' }> = {
  msimamizi: { views: '*', write: '*' },
  msomaji: { views: ['dashibodi', 'wanachama', 'michango', 'kuhaniwa', 'mikopo', 'miradi', 'hesabu', 'vikao', 'uongozi', 'taarifa', 'mipangilio'], write: [] },
  mhazini: { views: ['dashibodi', 'wanachama', 'michango', 'kuhaniwa', 'mikopo', 'miradi', 'hesabu', 'uongozi', 'taarifa'], write: ['payments', 'loans', 'projects', 'ledger'] },
  malipo: { views: ['michango', 'wanachama', 'taarifa'], write: ['payments'] },
  katibu: { views: ['wanachama', 'kuhaniwa', 'vikao', 'uongozi', 'taarifa'], write: ['members', 'events', 'meetings', 'cabinet', 'notices', 'about'] },
  mwanachama: { views: ['zangu', 'taarifa'], write: [] },
};
/** Sehemu kuu ya data ya kila ukurasa: inaamua kama ukurasa unaruhusu kuandika. */
export const VIEW_COL: Record<string, string> = {
  dashibodi: 'payments', wanachama: 'members', mwanachama: 'members', michango: 'payments', kuhaniwa: 'events',
  mikopo: 'loans', miradi: 'projects', hesabu: 'ledger', vikao: 'meetings', uongozi: 'cabinet', taarifa: 'notices',
  mipangilio: 'settings', watumiaji: 'settings',
};
/** Makusanyo ambayo kila nafasi inaruhusiwa kusoma kwenye backend. */
export const READ: Record<string, Col[] | '*'> = {
  msimamizi: '*',
  msomaji: '*',
  mhazini: ['members', 'payments', 'loans', 'projects', 'ledger', 'events', 'cabinet', 'notices'],
  malipo: ['members', 'payments', 'cabinet', 'notices'],
  katibu: ['members', 'events', 'meetings', 'cabinet', 'notices'],
  mwanachama: ['members', 'payments', 'loans', 'events', 'cabinet', 'notices'],
};

export const VIEWS: [string, string][] = [
  ['dashibodi', 'Dashibodi'], ['wanachama', 'Wanachama'], ['michango', 'Michango'], ['kuhaniwa', 'Kuhaniwa'],
  ['mikopo', 'Mikopo'], ['miradi', 'Miradi'], ['hesabu', 'Hesabu'], ['vikao', 'Vikao'], ['uongozi', 'Uongozi'],
  ['taarifa', 'Taarifa za Mfuko'], ['mipangilio', 'Mipangilio'],
];

export const ICONS: Record<string, string> = {
  home: 'M3 11l9-7 9 7M5 9.5V20h5v-6h4v6h5V9.5',
  users: 'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-1.5a4 4 0 0 0-3-3.9M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  coins: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  heart: 'M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z',
  loan: 'M2 15h4l6 2.5 7-3.5a1.6 1.6 0 0 0-1.3-2.9L13.5 12.5H10M2 20h4M16 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7',
  brief: 'M3.5 7.5h17v12h-17zM9 7.5V4.5h6v3M3.5 12.5h17',
  chart: 'M5 20V11M10.5 20V5M16 20v-7M21.5 20H2.5',
  cal: 'M4 5.5h16V20H4zM4 10h16M8 3v4M16 3v4',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z',
  info: 'M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19zM12 11v6M12 7.5v.2',
  bank: 'M3 9.5l9-6 9 6M5 9.5v8M9.5 9.5v8M14.5 9.5v8M19 9.5v8M3 20h18',
  chev: 'M9 6l6 6-6 6',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  help: 'M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19zM9.3 9.3a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.2.9-1.2 1.8v.6M12 17v.2',
  alert: 'M12 3.5l9.5 17h-19zM12 10v5M12 17.5v.2',
  wallet: 'M3.5 6.5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-15zM3.5 6.5l11-3v3M16 13.5h4.5',
};
