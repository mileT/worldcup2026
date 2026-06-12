export type GroupId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Team {
  id: string;
  name: string;
  /** flagcdn.com country code */
  flag: string;
}

export const TEAMS: Record<string, Team> = {
  MEX: { id: 'MEX', name: 'Mexico', flag: 'mx' },
  KOR: { id: 'KOR', name: 'South Korea', flag: 'kr' },
  RSA: { id: 'RSA', name: 'South Africa', flag: 'za' },
  CZE: { id: 'CZE', name: 'Czechia', flag: 'cz' },

  CAN: { id: 'CAN', name: 'Canada', flag: 'ca' },
  SUI: { id: 'SUI', name: 'Switzerland', flag: 'ch' },
  QAT: { id: 'QAT', name: 'Qatar', flag: 'qa' },
  BIH: { id: 'BIH', name: 'Bosnia & Herzegovina', flag: 'ba' },

  BRA: { id: 'BRA', name: 'Brazil', flag: 'br' },
  MAR: { id: 'MAR', name: 'Morocco', flag: 'ma' },
  SCO: { id: 'SCO', name: 'Scotland', flag: 'gb-sct' },
  HAI: { id: 'HAI', name: 'Haiti', flag: 'ht' },

  USA: { id: 'USA', name: 'United States', flag: 'us' },
  AUS: { id: 'AUS', name: 'Australia', flag: 'au' },
  PAR: { id: 'PAR', name: 'Paraguay', flag: 'py' },
  TUR: { id: 'TUR', name: 'Türkiye', flag: 'tr' },

  GER: { id: 'GER', name: 'Germany', flag: 'de' },
  ECU: { id: 'ECU', name: 'Ecuador', flag: 'ec' },
  CIV: { id: 'CIV', name: "Côte d'Ivoire", flag: 'ci' },
  CUW: { id: 'CUW', name: 'Curaçao', flag: 'cw' },

  NED: { id: 'NED', name: 'Netherlands', flag: 'nl' },
  JPN: { id: 'JPN', name: 'Japan', flag: 'jp' },
  TUN: { id: 'TUN', name: 'Tunisia', flag: 'tn' },
  SWE: { id: 'SWE', name: 'Sweden', flag: 'se' },

  BEL: { id: 'BEL', name: 'Belgium', flag: 'be' },
  IRN: { id: 'IRN', name: 'Iran', flag: 'ir' },
  EGY: { id: 'EGY', name: 'Egypt', flag: 'eg' },
  NZL: { id: 'NZL', name: 'New Zealand', flag: 'nz' },

  ESP: { id: 'ESP', name: 'Spain', flag: 'es' },
  URU: { id: 'URU', name: 'Uruguay', flag: 'uy' },
  KSA: { id: 'KSA', name: 'Saudi Arabia', flag: 'sa' },
  CPV: { id: 'CPV', name: 'Cape Verde', flag: 'cv' },

  FRA: { id: 'FRA', name: 'France', flag: 'fr' },
  SEN: { id: 'SEN', name: 'Senegal', flag: 'sn' },
  NOR: { id: 'NOR', name: 'Norway', flag: 'no' },
  IRQ: { id: 'IRQ', name: 'Iraq', flag: 'iq' },

  ARG: { id: 'ARG', name: 'Argentina', flag: 'ar' },
  AUT: { id: 'AUT', name: 'Austria', flag: 'at' },
  ALG: { id: 'ALG', name: 'Algeria', flag: 'dz' },
  JOR: { id: 'JOR', name: 'Jordan', flag: 'jo' },

  POR: { id: 'POR', name: 'Portugal', flag: 'pt' },
  COL: { id: 'COL', name: 'Colombia', flag: 'co' },
  UZB: { id: 'UZB', name: 'Uzbekistan', flag: 'uz' },
  COD: { id: 'COD', name: 'DR Congo', flag: 'cd' },

  ENG: { id: 'ENG', name: 'England', flag: 'gb-eng' },
  CRO: { id: 'CRO', name: 'Croatia', flag: 'hr' },
  PAN: { id: 'PAN', name: 'Panama', flag: 'pa' },
  GHA: { id: 'GHA', name: 'Ghana', flag: 'gh' },
};

export const GROUP_IDS: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

/** Official 2026 World Cup groups (final draw, in pot order). */
export const INITIAL_GROUPS: Record<GroupId, string[]> = {
  A: ['MEX', 'KOR', 'RSA', 'CZE'],
  B: ['CAN', 'SUI', 'QAT', 'BIH'],
  C: ['BRA', 'MAR', 'SCO', 'HAI'],
  D: ['USA', 'AUS', 'PAR', 'TUR'],
  E: ['GER', 'ECU', 'CIV', 'CUW'],
  F: ['NED', 'JPN', 'TUN', 'SWE'],
  G: ['BEL', 'IRN', 'EGY', 'NZL'],
  H: ['ESP', 'URU', 'KSA', 'CPV'],
  I: ['FRA', 'SEN', 'NOR', 'IRQ'],
  J: ['ARG', 'AUT', 'ALG', 'JOR'],
  K: ['POR', 'COL', 'UZB', 'COD'],
  L: ['ENG', 'CRO', 'PAN', 'GHA'],
};

export type Slot =
  | { type: 'group'; group: GroupId; pos: 1 | 2 }
  | { type: 'third'; match: number }
  | { type: 'winner'; match: number };

export type RoundId = 'R32' | 'R16' | 'QF' | 'SF' | 'F';

export interface MatchDef {
  id: number;
  round: RoundId;
  home: Slot;
  away: Slot;
}

/**
 * Groups whose third-placed team is allowed to fill each third-place
 * bracket slot (per the official FIFA 2026 bracket).
 */
export const THIRD_SLOT_OPTIONS: Record<number, GroupId[]> = {
  74: ['A', 'B', 'C', 'D', 'F'], // vs 1E
  77: ['C', 'D', 'F', 'G', 'H'], // vs 1I
  79: ['C', 'E', 'F', 'H', 'I'], // vs 1A
  80: ['E', 'H', 'I', 'J', 'K'], // vs 1L
  81: ['B', 'E', 'F', 'I', 'J'], // vs 1D
  82: ['A', 'E', 'H', 'I', 'J'], // vs 1G
  85: ['E', 'F', 'G', 'I', 'J'], // vs 1B
  87: ['D', 'E', 'I', 'J', 'L'], // vs 1K
};

const g = (group: GroupId, pos: 1 | 2): Slot => ({ type: 'group', group, pos });
const t = (match: number): Slot => ({ type: 'third', match });
const w = (match: number): Slot => ({ type: 'winner', match });

/** Official 2026 knockout bracket (match numbers 73-102, final = 104). */
export const MATCHES: MatchDef[] = [
  // Round of 32
  { id: 73, round: 'R32', home: g('A', 2), away: g('B', 2) },
  { id: 74, round: 'R32', home: g('E', 1), away: t(74) },
  { id: 75, round: 'R32', home: g('F', 1), away: g('C', 2) },
  { id: 76, round: 'R32', home: g('C', 1), away: g('F', 2) },
  { id: 77, round: 'R32', home: g('I', 1), away: t(77) },
  { id: 78, round: 'R32', home: g('E', 2), away: g('I', 2) },
  { id: 79, round: 'R32', home: g('A', 1), away: t(79) },
  { id: 80, round: 'R32', home: g('L', 1), away: t(80) },
  { id: 81, round: 'R32', home: g('D', 1), away: t(81) },
  { id: 82, round: 'R32', home: g('G', 1), away: t(82) },
  { id: 83, round: 'R32', home: g('K', 2), away: g('L', 2) },
  { id: 84, round: 'R32', home: g('H', 1), away: g('J', 2) },
  { id: 85, round: 'R32', home: g('B', 1), away: t(85) },
  { id: 86, round: 'R32', home: g('J', 1), away: g('H', 2) },
  { id: 87, round: 'R32', home: g('K', 1), away: t(87) },
  { id: 88, round: 'R32', home: g('D', 2), away: g('G', 2) },
  // Round of 16
  { id: 89, round: 'R16', home: w(74), away: w(77) },
  { id: 90, round: 'R16', home: w(73), away: w(75) },
  { id: 91, round: 'R16', home: w(76), away: w(78) },
  { id: 92, round: 'R16', home: w(79), away: w(80) },
  { id: 93, round: 'R16', home: w(83), away: w(84) },
  { id: 94, round: 'R16', home: w(81), away: w(82) },
  { id: 95, round: 'R16', home: w(86), away: w(88) },
  { id: 96, round: 'R16', home: w(85), away: w(87) },
  // Quarter-finals
  { id: 97, round: 'QF', home: w(89), away: w(90) },
  { id: 98, round: 'QF', home: w(93), away: w(94) },
  { id: 99, round: 'QF', home: w(91), away: w(92) },
  { id: 100, round: 'QF', home: w(95), away: w(96) },
  // Semi-finals
  { id: 101, round: 'SF', home: w(97), away: w(98) },
  { id: 102, round: 'SF', home: w(99), away: w(100) },
  // Final
  { id: 104, round: 'F', home: w(101), away: w(102) },
];

export const MATCH_BY_ID: Record<number, MatchDef> = Object.fromEntries(
  MATCHES.map((m) => [m.id, m]),
);

export const ROUND_LABELS: Record<RoundId, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter-finals',
  SF: 'Semi-finals',
  F: 'Final',
};

/** Bracket layout: left half feeds SF 101, right half feeds SF 102. */
export const BRACKET_LAYOUT = {
  left: { R32: [74, 77, 73, 75, 83, 84, 81, 82], R16: [89, 90, 93, 94], QF: [97, 98], SF: [101] },
  right: { R32: [76, 78, 79, 80, 86, 88, 85, 87], R16: [91, 92, 95, 96], QF: [99, 100], SF: [102] },
  final: 104,
};

export function flagUrl(team: Team, size: 40 | 80 = 40): string {
  return `https://flagcdn.com/w${size}/${team.flag}.png`;
}
