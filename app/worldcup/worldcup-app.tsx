'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
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
  SlotLabeler,
  championRoad,
  resolveBracket,
} from './logic';
import {
  I18nProvider,
  LANGUAGES,
  Lang,
  Strings,
  fmt,
  useI18n,
} from './i18n';

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
  const { teamName } = useI18n();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl(team, 40)}
      alt={`${teamName(team.id)} flag`}
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
  const { t, teamName } = useI18n();
  const team = teamId ? TEAMS[teamId] : null;
  return (
    <button
      type="button"
      disabled={!team}
      onClick={onClick}
      title={team ? t.clickToAdvance : undefined}
      className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs transition
        ${state === 'winner' ? 'bg-emerald-500/20 font-semibold text-emerald-300' : ''}
        ${state === 'loser' ? 'text-slate-500' : ''}
        ${state === 'none' && team ? 'text-slate-200 hover:bg-white/5' : ''}
        ${!team ? 'cursor-default text-slate-600' : ''}`}
    >
      {team ? (
        <>
          <Flag team={team} />
          <span className="truncate">{teamName(team.id)}</span>
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
  const { t, teamName } = useI18n();
  const rowStyle = (i: number) => {
    if (i < 2) return 'border-l-2 border-emerald-400/80 bg-emerald-500/[0.07]';
    if (i === 2 && thirdSelected) return 'border-l-2 border-amber-400/80 bg-amber-400/[0.07]';
    return 'border-l-2 border-transparent opacity-60';
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between rounded-t-xl border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <h3 className="text-sm font-bold tracking-wide text-slate-100">{fmt(t.groupLabel, { id: group })}</h3>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{t.dragToSort}</span>
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
              <span className="truncate text-slate-100">{teamName(team.id)}</span>
              <span className="ml-auto flex items-center gap-0.5">
                {i === 2 && (
                  <button
                    type="button"
                    onClick={() => onToggleThird(group)}
                    disabled={!thirdSelected && thirdsFull}
                    title={t.best3rdTitle}
                    className={`mr-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition
                      ${thirdSelected
                        ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-white/5 text-slate-500 ring-1 ring-white/10 hover:text-slate-300 disabled:opacity-40'}`}
                  >
                    {thirdSelected ? `${t.best3rd} ✓` : t.best3rd}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onMove(group, i, i - 1)}
                  disabled={i === 0}
                  aria-label={fmt(t.moveUp, { team: teamName(team.id) })}
                  className="rounded px-1 text-slate-500 hover:bg-white/10 hover:text-slate-200 disabled:invisible"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => onMove(group, i, i + 1)}
                  disabled={i === 3}
                  aria-label={fmt(t.moveDown, { team: teamName(team.id) })}
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

function roundShortLabel(matchId: number, t: Strings): string {
  if (matchId <= 88) return t.roundR32;
  if (matchId <= 96) return t.roundR16;
  if (matchId <= 100) return t.roundQF;
  if (matchId <= 102) return t.roundSF;
  return t.roundFinal;
}

function ChampionSection({
  road,
}: {
  road: { champion: string; road: ResolvedMatch[] } | null;
}) {
  const { t, teamName } = useI18n();
  if (!road) {
    return (
      <div className="mb-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-5 text-center text-sm text-slate-500">
        {t.championPrompt}
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
              {t.worldChampion}
            </div>
            <div className="text-2xl font-black text-yellow-300">{teamName(champ.id)}</div>
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
                  {roundShortLabel(m.id, t)}
                </span>
                {opp && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-200">
                    <span className="text-slate-500">{t.vs}</span>
                    <Flag team={opp} />
                    {teamName(opp.id)}
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
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.coffeeCta}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-amber-400/30 bg-slate-900 p-6 text-center shadow-2xl shadow-black/50"
      >
        <div className="text-5xl">☕</div>
        <h3 className="mt-3 text-lg font-bold text-slate-100">{t.coffeeTitle}</h3>
        <p className="mt-2 text-sm text-slate-400">{t.coffeeBody}</p>
        <a
          href="https://buymeacoffee.com/macstone"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="mt-5 block w-full rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-amber-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300"
        >
          ☕ {t.coffeeCta}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
        >
          {t.coffeeLater}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- language switcher --------------------------- */

function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <label className="relative flex items-center">
      <span className="sr-only">{t.selectLanguage}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label={t.selectLanguage}
        className="cursor-pointer rounded-lg border border-white/15 bg-slate-900 py-2 pl-3 pr-8 text-sm text-slate-200 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-slate-900 text-slate-100">
            {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-xs text-slate-400">▾</span>
    </label>
  );
}

/* --------------------------------- main app -------------------------------- */

export default function WorldCupApp() {
  return (
    <I18nProvider>
      <WorldCupInner />
    </I18nProvider>
  );
}

function WorldCupInner() {
  const { t, teamName } = useI18n();
  const [p, setP] = useState<Predictions>(defaultPredictions);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCoffee, setShowCoffee] = useState(false);
  const dragRef = useRef<{ group: GroupId; index: number } | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const labeler = useMemo<SlotLabeler>(
    () => ({
      winner: (g) => fmt(t.slotWinner, { g }),
      runner: (g) => fmt(t.slotRunner, { g }),
      third: (groups) => fmt(t.slotThird, { groups }),
      winnerMatch: (m) => fmt(t.slotWinnerMatch, { m }),
    }),
    [t],
  );

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

  const resolved = useMemo(() => resolveBracket(p, labeler), [p, labeler]);
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
    if (confirm(t.resetConfirm)) setP(defaultPredictions());
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
      alert(t.imageError);
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
              <span className="text-emerald-400">FIFA World Cup 2026</span> · {t.subtitle}
            </h1>
            <p className="text-xs text-slate-400">{t.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={saveImage}
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving ? t.saving : `📸 ${t.save}`}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              {t.reset}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1900px] px-4 sm:px-6">
        {/* group stage */}
        <section className="pt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-bold">{t.groupStage}</h2>
              <p className="text-xs text-slate-400">
                {t.groupHint.split(/(\{topTwo\}|\{thirds\})/).map((part, i) => {
                  if (part === '{topTwo}')
                    return (
                      <span key={i} className="text-emerald-400">
                        {t.topTwo}
                      </span>
                    );
                  if (part === '{thirds}')
                    return (
                      <span key={i} className="text-amber-300">
                        {t.thirds}
                      </span>
                    );
                  return <Fragment key={i}>{part}</Fragment>;
                })}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                thirdsCount === 8
                  ? 'bg-amber-400/10 text-amber-300 ring-amber-400/40'
                  : 'bg-red-500/10 text-red-300 ring-red-400/40'
              }`}
            >
              {fmt(t.bestThirds, { n: thirdsCount })}
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
              <h2 className="text-base font-bold">{t.knockoutTitle}</h2>
              <p className="text-xs text-slate-400">{t.knockoutHint}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            {/* export target: fits its content so the saved image is never clipped */}
            <div ref={exportRef} className="w-max min-w-full bg-slate-950 p-6">
              <ChampionSection road={road} />
              <div className="flex items-stretch gap-3">
                <BracketColumn title={t.roundR32} matchIds={BRACKET_LAYOUT.left.R32} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title={t.roundR16} matchIds={BRACKET_LAYOUT.left.R16} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title={t.colQuarters} matchIds={BRACKET_LAYOUT.left.QF} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title={t.roundSF} matchIds={BRACKET_LAYOUT.left.SF} resolved={resolved} onPick={pickWinner} />

                {/* final, centered */}
                <div className="flex h-[780px] flex-col">
                  <div className="pb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-yellow-400">
                    {t.finalDate}
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-center gap-3">
                    <span className="text-4xl">🏆</span>
                    <div className="rounded-lg ring-2 ring-yellow-400/40">
                      <MatchCard match={resolved[104]} onPick={pickWinner} />
                    </div>
                    {road && (
                      <div className="flex items-center gap-2 rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300 ring-1 ring-yellow-400/40">
                        <Flag team={TEAMS[road.champion]} />
                        {teamName(road.champion)}
                      </div>
                    )}
                  </div>
                </div>

                <BracketColumn title={t.roundSF} matchIds={BRACKET_LAYOUT.right.SF} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title={t.colQuarters} matchIds={BRACKET_LAYOUT.right.QF} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title={t.roundR16} matchIds={BRACKET_LAYOUT.right.R16} resolved={resolved} onPick={pickWinner} />
                <BracketColumn title={t.roundR32} matchIds={BRACKET_LAYOUT.right.R32} resolved={resolved} onPick={pickWinner} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <CoffeeModal open={showCoffee} onClose={() => setShowCoffee(false)} />
    </main>
  );
}
