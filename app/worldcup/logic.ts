import {
  GroupId,
  MATCHES,
  Slot,
  THIRD_SLOT_OPTIONS,
} from './data';

export interface Predictions {
  /** Team ids in predicted finishing order (index 0 = group winner). */
  groups: Record<GroupId, string[]>;
  /** Groups whose third-placed team advances (exactly 8 to complete the bracket). */
  thirds: GroupId[];
  /** Picked winner (team id) per knockout match id. */
  winners: Record<number, string>;
}

const THIRD_SLOTS = Object.keys(THIRD_SLOT_OPTIONS).map(Number);

/**
 * Assign the qualified third-placed groups to the third-place bracket slots
 * so that no slot receives a group outside its allowed list (mirrors FIFA's
 * Annex C combination table). Solved as a bipartite matching via backtracking;
 * a valid assignment exists for every combination of 8 groups.
 */
export function assignThirdSlots(qualified: GroupId[]): Record<number, GroupId> {
  if (qualified.length !== THIRD_SLOTS.length) return {};

  // Most-constrained slot first keeps the search tiny and deterministic.
  const slots = [...THIRD_SLOTS].sort(
    (a, b) =>
      THIRD_SLOT_OPTIONS[a].filter((gr) => qualified.includes(gr)).length -
      THIRD_SLOT_OPTIONS[b].filter((gr) => qualified.includes(gr)).length,
  );

  const result: Record<number, GroupId> = {};
  const used = new Set<GroupId>();

  function solve(i: number): boolean {
    if (i === slots.length) return true;
    const slot = slots[i];
    for (const gr of THIRD_SLOT_OPTIONS[slot]) {
      if (!qualified.includes(gr) || used.has(gr)) continue;
      result[slot] = gr;
      used.add(gr);
      if (solve(i + 1)) return true;
      delete result[slot];
      used.delete(gr);
    }
    return false;
  }

  if (!solve(0)) {
    // Should never happen; fall back to filling slots in order.
    const remaining = qualified.filter((gr) => !used.has(gr));
    for (const slot of slots) {
      if (!(slot in result)) result[slot] = remaining.shift()!;
    }
  }
  return result;
}

export interface ResolvedMatch {
  id: number;
  home: string | null;
  away: string | null;
  homeLabel: string;
  awayLabel: string;
  winner: string | null;
}

function slotLabel(slot: Slot): string {
  if (slot.type === 'group') return `${slot.pos === 1 ? 'Winner' : 'Runner-up'} ${slot.group}`;
  if (slot.type === 'third') return `3rd ${THIRD_SLOT_OPTIONS[slot.match].join('/')}`;
  return `Winner M${slot.match}`;
}

/**
 * Resolve every knockout match from the current predictions, dropping any
 * picked winner that is no longer one of the match participants.
 */
export function resolveBracket(p: Predictions): Record<number, ResolvedMatch> {
  const thirdAssignment = assignThirdSlots(p.thirds);
  const resolved: Record<number, ResolvedMatch> = {};

  const teamFor = (slot: Slot): string | null => {
    if (slot.type === 'group') return p.groups[slot.group]?.[slot.pos - 1] ?? null;
    if (slot.type === 'third') {
      const gr = thirdAssignment[slot.match];
      return gr ? p.groups[gr]?.[2] ?? null : null;
    }
    return resolved[slot.match]?.winner ?? null;
  };

  for (const m of MATCHES) {
    const home = teamFor(m.home);
    const away = teamFor(m.away);
    const picked = p.winners[m.id];
    const winner = picked && (picked === home || picked === away) ? picked : null;
    resolved[m.id] = {
      id: m.id,
      home,
      away,
      homeLabel: slotLabel(m.home),
      awayLabel: slotLabel(m.away),
      winner,
    };
  }
  return resolved;
}

/** The champion's matches from the Round of 32 to the Final, if complete. */
export function championRoad(
  resolved: Record<number, ResolvedMatch>,
): { champion: string; road: ResolvedMatch[] } | null {
  const final = resolved[104];
  if (!final?.winner) return null;
  const road = MATCHES.filter(
    (m) => resolved[m.id].winner === final.winner,
  ).map((m) => resolved[m.id]);
  return { champion: final.winner, road };
}
