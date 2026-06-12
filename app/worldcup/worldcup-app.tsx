'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BRACKET_LAYOUT,
  GROUP_IDS,
  GroupId,
  INITIAL_GROUPS,
  TEAMS,
  Team,
  flagUrl,
} from './data';
import {
  Predictions,
  ResolvedMatch,
  championRoad,
  resolveBracket,
} from './logic';

const STORAGE_KEY = 'wc2026-predictions-v1';

function defaultPredictions(): Predictions {
  return {
    groups: JSON.parse(JSON.stringify(INITIAL_GROUPS)),
    thirds: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    winners: {},
  };
}

/* ------------------------------ small pieces ------------------------------ */

function Flag({ team, className = 'h-4 w-6' }: { team: Team; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl(team, 40)}
      alt={`${team.name} flag`}
      crossOrigin="anonymous"
      className={`${className} shrink-0 rounded-[2px] object-cover ring-1 ring-white/20`}
    />
  );
}

function TeamRow({
  teamId,
  placeholder,
  state,
  onClick,
}: {
  teamId: string | null;
  placeholder: string;
  state: 'winner' | 'loser' | 'none';
  onClick?: () => void;
}) {
  const team = teamId ? TEAMS[teamId] : null;
  return (
    <button
      type="button"
      disabled={!team}
      onClick={onClick}
      title={team ? 'Click to advance' : undefined}
      className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs transition
        ${state === 'winner' ? 'bg-emerald-500/20 font-semibold text-emerald-300' : ''}
        ${state === 'loser' ? 'text-slate-500' : ''}
        ${state === 'none' && team ? 'text-slate-200 hover:bg-white/5' : ''}
        ${!team ? 'cursor-default text-slate-600' : ''}`}
    >
      {team ? (
        <>
          <Flag team={team} />
          <span className="truncate">{team.name}</span>
          {state === 'winner' && <span className="ml-auto text-emerald-400">›</span>}
        </>
      ) : (
        <span className="truncate italic">{placeholder}</span>
      )}
    </button>
  );
}

function MatchCard({
  match,
  onPick,
}: {
  match: ResolvedMatch;
  onPick: (matchId: number, teamId: string) => void;
}) {
  const rowState = (teamId: string | null): 'winner' | 'loser' | 'none' => {
    if (!match.winner || !teamId) return 'none';
    return match.winner === teamId ? 'winner' : 'loser';
  };
  return (
    <div className="w-[196px] overflow-hidden rounded-lg border border-white/10 bg-slate-900/90 shadow-lg shadow-black/30">
      <TeamRow
        teamId={match.home}
        placeholder={match.homeLabel}
        state={rowState(match.home)}
        onClick={() => match.home && onPick(match.id, match.home)}
      />
      <div className="h-px bg-white/10" />
      <TeamRow
        teamId={match.away}
        placeholder={match.awayLabel}
        state={rowState(match.away)}
        onClick={() => match.away && onPick(match.id, match.away)}
      />
    </div>
  );
}

function BracketColumn({
  title,
  matchIds,
  resolved,
  onPick,
}: {
  title: string;
  matchIds: number[];
  resolved: Record<number, ResolvedMatch>;
  onPick: (matchId: number, teamId: string) => void;
}) {
  return (
    <div className="flex h-[780px] flex-col">
      <div className="pb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </div>
      <div className="flex flex-1 flex-col justify-around gap-2">
        {matchIds.map((id) => (
          <MatchCard key={id} match={resolved[id]} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- group card ------------------------------ */

function GroupCard({
  group,
  order,
  thirdSelected,
  thirdsFull,
  onMove,
  onToggleThird,
  dragRef,
}: {
  group: GroupId;
  order: string[];
  thirdSelected: boolean;
  thirdsFull: boolean;
  onMove: (group: GroupId, from: number, to: number) => void;
  onToggleThird: (group: GroupId) => void;
  dragRef: React.MutableRefObject<{ group: GroupId; index: number } | null>;
}) {
  const rowStyle = (i: number) => {
    if (i < 2) return 'border-l-2 border-emerald-400/80 bg-emerald-500/[0.07]';
    if (i === 2 && thirdSelected) return 'border-l-2 border-amber-400/80 bg-amber-400/[0.07]';
    return 'border-l-2 border-transparent opacity-60';
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between rounded-t-xl border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <h3 className="text-sm font-bold tracking-wide text-slate-100">Group {group}</h3>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">drag to sort</span>
      </div>
      <ul>
        {order.map((teamId, i) => {
          const team = TEAMS[teamId];
          return (
            <li
              key={teamId}
              draggable
              onDragStart={() => (dragRef.current = { group, index: i })}
              onDragOver={(e) => {
                if (dragRef.current?.group === group) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const d = dragRef.current;
                if (d && d.group === group && d.index !== i) onMove(group, d.index, i);
                dragRef.current = null;
              }}
              className={`flex cursor-grab items-center gap-2 px-2.5 py-2 text-sm active:cursor-grabbing ${rowStyle(i)}`}
            >
              <span className="w-4 text-center text-xs font-bold text-slate-500">{i + 1}</span>
              <Flag team={team} className="h-[18px] w-[27px]" />
              <span className="truncate text-slate-100">{team.name}</span>
              <span className="ml-auto flex items-center gap-0.5">
                {i === 2 && (
                  <button
                    type="button"
                    onClick={() => onToggleThird(group)}
                    disabled={!thirdSelected && thirdsFull}
                    title="Toggle: advances as one of the 8 best third-placed teams"
                    className={`mr-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition
                      ${thirdSelected
                        ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-white/5 text-slate-500 ring-1 ring-white/10 hover:text-slate-300 disabled:opacity-40'}`}
                  >
                    {thirdSelected ? 'BEST 3RD ✓' : 'BEST 3RD'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onMove(group, i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Move ${team.name} up`}
                  className="rounded px-1 text-slate-500 hover:bg-white/10 hover:text-slate-200 disabled:invisible"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => onMove(group, i, i + 1)}
                  disabled={i === 3}
                  aria-label={`Move ${team.name} down`}
                  className="rounded px-1 text-slate-500 hover:bg-white/10 hover:text-slate-200 disabled:invisible"
                >
                  ▼
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ----------------------------- champion banner ----------------------------- */

const ROUND_SHORT: Record<string, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter-final',
  SF: 'Semi-final',
  F: 'Final',
};

function roundOf(matchId: number): string {
  if (matchId <= 88) return 'R32';
  if (matchId <= 96) return 'R16';
  if (matchId <= 100) return 'QF';
  if (matchId <= 102) return 'SF';
  return 'F';
}

function ChampionSection({
  road,
}: {
  road: { champion: string; road: ResolvedMatch[] } | null;
}) {
  if (!road) {
    return (
      <div className="mb-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-5 text-center text-sm text-slate-500">
        Pick winners through the bracket below — your champion and their road will appear here.
      </div>
    );
  }
  const champ = TEAMS[road.champion];
  return (
    <div className="mb-6 rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-yellow-400/10 via-amber-300/5 to-yellow-400/10 px-6 py-5">
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <Flag team={champ} className="h-8 w-12" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400/80">
              World Champion
            </div>
            <div className="text-2xl font-black text-yellow-300">{champ.name}</div>
          </div>
        </div>
        <ol className="flex flex-wrap items-center gap-2">
          {road.road.map((m) => {
            const oppId = m.home === road.champion ? m.away : m.home;
            const opp = oppId ? TEAMS[oppId] : null;
            return (
              <li
                key={m.id}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5"
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  {ROUND_SHORT[roundOf(m.id)]}
                </span>
                {opp && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-200">
                    <span className="text-slate-500">vs</span>
                    <Flag team={opp} />
                    {opp.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------- coffee modal ------------------------------ */

function CoffeeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buy me a coffee"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-amber-400/30 bg-slate-900 p-6 text-center shadow-2xl shadow-black/50"
      >
        <div className="text-5xl">☕</div>
        <h3 className="mt-3 text-lg font-bold text-slate-100">
          Your road map is downloading!
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Enjoying the World Cup predictor? If you'd like to support it, you can buy me a
          coffee — it keeps the predictions brewing.
        </p>
        <a
          href="https://buymeacoffee.com/macstone"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="mt-5 block w-full rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-amber-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300"
        >
          ☕ Buy me a coffee
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- main app -------------------------------- */

export default function WorldCupApp() {
  const [p, setP] = useState<Predictions>(defaultPredictions);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCoffee, setShowCoffee] = useState(false);
  const dragRef = useRef<{ group: GroupId; index: number } | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setP(JSON.parse(raw));
    } catch {
      /* corrupted storage — start fresh */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }, [p, loaded]);

  const resolved = useMemo(() => resolveBracket(p), [p]);
  const road = useMemo(() => championRoad(resolved), [resolved]);

  const moveTeam = (group: GroupId, from: number, to: number) => {
    if (to < 0 || to > 3) return;
    setP((prev) => {
      const order = [...prev.groups[group]];
      const [moved] = order.splice(from, 1);
      order.splice(to, 0, moved);
      return { ...prev, groups: { ...prev.groups, [group]: order } };
    });
  };

  const toggleThird = (group: GroupId) => {
    setP((prev) => {
      const has = prev.thirds.includes(group);
      if (!has && prev.thirds.length >= 8) return prev;
      return {
        ...prev,
        thirds: has ? prev.thirds.filter((g) => g !== group) : [...prev.thirds, group],
      };
    });
  };

  const pickWinner = (matchId: number, teamId: string) => {
    setP((prev) => {
      const winners = { ...prev.winners };
      if (winners[matchId] === teamId) delete winners[matchId];
      else winners[matchId] = teamId;
      return { ...prev, winners };
    });
  };

  const reset = () => {
    if (confirm('Reset all predictions?')) setP(defaultPredictions());
  };

  const saveImage = async () => {
    if (!exportRef.current || saving) return;
    setSaving(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#020617',
      });
      const link = document.createElement('a');
      link.download = 'world-cup-2026-road-to-champion.png';
      link.href = dataUrl;
      link.click();
      setShowCoffee(true);
    } catch (err) {
      console.error(err);
      alert('Sorry, the image could not be generated.');
    } finally {
      setSaving(false);
    }
  };

  const thirdsCount = p.thirds.length;

  return (
    <main className="min-h-screen bg-slate-950 pb-20 text-slate-100 [background-image:radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]">
      {/* header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1900px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-black tracking-tight sm:text-xl">
              <span className="text-emerald-400">FIFA World Cup 2026</span> · Bracket Predictor
            </h1>
            <p className="text-xs text-slate-400">
              Sort each group, pick every knockout winner, crown your champion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveImage}
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving ? 'Saving…' : '📸 Save road map image'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1900px] px-4 sm:px-6">
        {/* group stage */}
        <section className="pt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-bold">Group Stage</h2>
              <p className="text-xs text-slate-400">
                Drag (or use the arrows) to order each group.{' '}
                <span className="text-emerald-400">Top two advance</span>; mark the{' '}
                <span className="text-amber-300">8 best third-placed teams</span>.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                thirdsCount === 8
                  ? 'bg-amber-400/10 text-amber-300 ring-amber-400/40'
                  : 'bg-red-500/10 text-red-300 ring-red-400/40'
              }`}
            >
              Best thirds: {thirdsCount}/8 selected
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {GROUP_IDS.map((gid) => (
              <GroupCard
                key={gid}
                group={gid}
                order={p.groups[gid]}
                thirdSelected={p.thirds.includes(gid)}
                thirdsFull={thirdsCount >= 8}
                onMove={moveTeam}
                onToggleThird={toggleThird}
                dragRef={dragRef}
              />
            ))}
          </div>
        </section>

        {/* knockout stage */}
        <section className="pt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-bold">Knockout Stage — Road to the Final</h2>
              <p className="text-xs text-slate-400">
                Click a team to advance it. The final is in the middle. Scroll sideways on small
                screens.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            {/* export target: fits its content so the saved image is never clipped */}
            <div ref={exportRef} className="w-max min-w-full bg-slate-950 p-6">
              <ChampionSection road={road} />
              <div className="flex items-stretch gap-3">
                <BracketColumn title="Round of 32" matchIds={BRACKET_LAYOUT.left.R32} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title="Round of 16" matchIds={BRACKET_LAYOUT.left.R16} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title="Quarters" matchIds={BRACKET_LAYOUT.left.QF} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title="Semi-final" matchIds={BRACKET_LAYOUT.left.SF} resolved={resolved} onPick={pickWinner} />

                {/* final, centered */}
                <div className="flex h-[780px] flex-col">
                  <div className="pb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-yellow-400">
                    Final · July 19
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-center gap-3">
                    <span className="text-4xl">🏆</span>
                    <div className="rounded-lg ring-2 ring-yellow-400/40">
                      <MatchCard match={resolved[104]} onPick={pickWinner} />
                    </div>
                    {road && (
                      <div className="flex items-center gap-2 rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300 ring-1 ring-yellow-400/40">
                        <Flag team={TEAMS[road.champion]} />
                        {TEAMS[road.champion].name}
                      </div>
                    )}
                  </div>
                </div>

                <BracketColumn title="Semi-final" matchIds={BRACKET_LAYOUT.right.SF} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title="Quarters" matchIds={BRACKET_LAYOUT.right.QF} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title="Round of 16" matchIds={BRACKET_LAYOUT.right.R16} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title="Round of 32" matchIds={BRACKET_LAYOUT.right.R32} resolved={resolved} onPick={pickWinner} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <CoffeeModal open={showCoffee} onClose={() => setShowCoffee(false)} />
    </main>
  );
}
