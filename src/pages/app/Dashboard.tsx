import { ArrowRight, ArrowUpRight, BookOpen, Clock, MessageCircle, Moon, Play } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { AchievementBadge } from '@/components/AchievementBadge';
import { ButtonLink } from '@/components/Button';
import { CheckDraw } from '@/components/CheckDraw';
import { CheckInCard } from '@/components/CheckIn';
import { Counter } from '@/components/Counter';
import { DrillDiagram } from '@/components/DrillDiagram';
import { PageHeader } from '@/components/PageHeader';
import { ARTICLES } from '@/data/articles';
import { COACH, notesFor } from '@/data/coach';
import { LEVEL_BY_ID, POSITION_BY_ID, WEEKDAYS } from '@/data/positions';
import { nextAchievement } from '@/lib/achievements';
import { addDays, dateKey, formatLongDate, greeting, startOfWeek } from '@/lib/dates';
import { useDocumentTitle } from '@/lib/hooks';
import { fuelTargets, NUTRIENT_BY_ID } from '@/lib/nutrition';
import { buildWeekPlan, COOL_DOWN_MINUTES, WARM_UP_MINUTES } from '@/lib/plan';
import { useReveal } from '@/lib/reveal';
import { computeStats, isTrained, weekSummary } from '@/lib/stats';
import { useStore } from '@/lib/store';
import '@/styles/pages.css';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const state = useStore();
  const { profile, activity } = state;
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const now = new Date();
  const todayKey = dateKey(now);
  const plan = useMemo(() => buildWeekPlan(profile), [profile]);
  const session = plan.sessions.find((s) => s.date === todayKey);
  const nextSession = plan.sessions.find((s) => s.date > todayKey);
  const stats = computeStats(state, now);
  const fuel = fuelTargets(profile.weightKg, session ? 'training' : 'rest');
  const next = nextAchievement(stats);
  const note = notesFor(profile.position)[0];
  const tip = ARTICLES[(Math.floor(now.getTime() / 86_400_000) + 3) % ARTICLES.length];
  const todayDrills = new Set(activity[todayKey]?.drills.map((d) => d.id));
  const sessionDone = session ? activity[todayKey]?.planSessions.includes(session.id) : false;
  const firstUndone = session?.drills.find((d) => !todayDrills.has(d.id)) ?? session?.drills[0];
  const pos = POSITION_BY_ID[profile.position];

  const start = startOfWeek(now);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const key = dateKey(d);
    const log = activity[key];
    return { label: WEEKDAYS[i], key, drills: log?.drills.length ?? 0, trained: isTrained(log), future: key > todayKey };
  });
  const maxDrills = Math.max(3, ...last7.map((d) => d.drills));

  return (
    <div ref={root} className="page dashboard">
      <PageHeader
        eyebrow={formatLongDate(now)}
        title={
          <>
            {greeting(now)}, <span className="serif">{profile.name}.</span>
          </>
        }
        sub={`${pos.name} · ${LEVEL_BY_ID[profile.level].name}. Here’s your football HQ for today.`}
      />

      <div className="dash-grid">
        {/* Today's session */}
        <section className="card card--dark theme-dark dash-session" data-reveal="up" aria-labelledby="today-title">
          <div className="card__head">
            <p className="eyebrow">Today’s session</p>
            {session && (
              <span className="chip chip--volt">
                <Clock size={14} /> {session.minutes} min
              </span>
            )}
          </div>
          {session ? (
            <>
              <h2 id="today-title" className="dash-session__title">
                {session.theme.name}
                <span className="serif"> — {session.theme.blurb}</span>
              </h2>
              <ol className="dash-session__list">
                <li className="dash-step dash-step--muted">
                  <span className="dash-step__n">1</span>
                  <span className="dash-step__text">
                    <b>Warm-up</b>
                    <small>Jog, skip, side-steps · {WARM_UP_MINUTES} min</small>
                  </span>
                </li>
                {session.drills.map((d, i) => (
                  <li key={d.id}>
                    <Link to={`/drills/${d.id}`} className="dash-step" data-done={todayDrills.has(d.id) || undefined} data-cursor="Open">
                      <span className="dash-step__n">{i + 2}</span>
                      <span className="dash-step__thumb">
                        <DrillDiagram diagram={d.diagram} />
                      </span>
                      <span className="dash-step__text">
                        <b>{d.name}</b>
                        <small>
                          {d.duration} min · {d.cue}
                        </small>
                      </span>
                      <span className="dash-step__check">
                        <CheckDraw done={todayDrills.has(d.id)} size={16} />
                      </span>
                    </Link>
                  </li>
                ))}
                <li className="dash-step dash-step--muted">
                  <span className="dash-step__n">{session.drills.length + 2}</span>
                  <span className="dash-step__text">
                    <b>Cool-down</b>
                    <small>Gentle stretches · {COOL_DOWN_MINUTES} min</small>
                  </span>
                </li>
              </ol>
              <div className="dash-session__actions">
                {sessionDone ? (
                  <p className="dash-session__done">
                    <CheckDraw done size={18} /> Session complete. Great work!
                  </p>
                ) : (
                  <ButtonLink to={`/drills/${firstUndone?.id}?start=1`} variant="accent" size="lg" magnetic iconLeft={<Play size={18} />}>
                    Start session
                  </ButtonLink>
                )}
                <ButtonLink to="/plan" variant="secondary" size="lg">
                  See my week
                </ButtonLink>
              </div>
            </>
          ) : (
            <div className="dash-rest">
              <span className="dash-rest__icon">
                <Moon size={26} />
              </span>
              <h2 id="today-title" className="dash-session__title">
                Rest & recover<span className="serif"> — your body gets stronger today.</span>
              </h2>
              <ul className="dash-rest__list">
                <li>Play for fun with friends if you feel like it</li>
                <li>Some gentle stretches before bed</li>
                <li>Drink water and get a good night’s sleep</li>
              </ul>
              {nextSession && (
                <p className="dash-rest__next">
                  Next session: <b>{WEEKDAYS[nextSession.weekday]}</b> · {nextSession.theme.name}
                </p>
              )}
              <ButtonLink to="/plan" variant="secondary" size="lg" icon={<ArrowRight size={18} />}>
                See my week
              </ButtonLink>
            </div>
          )}
        </section>

        {/* Streak + check-in */}
        <div className="dash-streak" data-reveal="up">
          <CheckInCard />
        </div>

        {/* Fuel */}
        <section className="card dash-fuel card--hover" data-reveal="up" aria-labelledby="fuel-title">
          <div className="card__head">
            <h2 id="fuel-title" className="card__title">
              Fuel your game
            </h2>
            <span className="chip">{session ? 'Training day' : 'Rest day'}</span>
          </div>
          <div className="dash-fuel__grid">
            {fuel.map((t) => {
              const n = NUTRIENT_BY_ID[t.id];
              return (
                <div key={t.id} className="dash-fuel__item" style={{ ['--tone' as string]: `var(${n.tone})` }}>
                  <span className="dash-fuel__name">{n.short}</span>
                  <span className="dash-fuel__num">
                    <Counter value={t.grams} />
                    <small>g</small>
                  </span>
                  <span className="dash-fuel__job">{n.job}</span>
                  <span className="dash-fuel__bar">
                    <i style={{ transform: `scaleX(${Math.min(1, t.share + 0.25)})` }} />
                  </span>
                </div>
              );
            })}
          </div>
          <Link to="/nutrition" className="text-link dash-link">
            Sized for {profile.weightKg} kg · See why <ArrowRight size={16} />
          </Link>
        </section>

        {/* Progress */}
        <section className="card dash-progress card--hover" data-reveal="up" aria-labelledby="progress-title">
          <div className="card__head">
            <h2 id="progress-title" className="card__title">
              Your progress
            </h2>
            <Link to="/progress" className="icon-btn" aria-label="Open progress">
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <p className="dash-progress__headline">{weekSummary(stats.thisWeek)}</p>
          <div className="dash-progress__row">
            <div className="dash-chart" aria-label="Drills completed each day this week" role="img">
              {last7.map((d) => (
                <span
                  key={d.key}
                  className="dash-chart__col"
                  data-trained={d.trained || undefined}
                  data-future={d.future || undefined}
                  data-today={d.key === todayKey || undefined}
                >
                  <i style={{ height: `${d.trained ? Math.max(18, (d.drills / maxDrills) * 100) : 6}%` }} />
                  <small>{d.label.slice(0, 1)}</small>
                </span>
              ))}
            </div>
            <dl className="dash-stats">
              <div>
                <dt>Drills done</dt>
                <dd>
                  <Counter value={stats.totalDrills} />
                </dd>
              </div>
              <div>
                <dt>Minutes</dt>
                <dd>
                  <Counter value={stats.minutes} />
                </dd>
              </div>
              <div>
                <dt>Best streak</dt>
                <dd>
                  <Counter value={stats.bestStreak} />
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Coach note */}
        {note && (
          <Link to="/coach" className="card card--hover dash-coach" data-reveal="up" data-cursor="Read">
            <div className="dash-coach__head">
              <span className="coach-badge__avatar" style={{ width: 40, height: 40, fontSize: 13 }}>
                {COACH.initials}
              </span>
              <span>
                <b>{COACH.name}</b>
                <small>{note.topic}</small>
              </span>
              <MessageCircle size={18} className="dash-coach__icon" />
            </div>
            <p className="dash-coach__msg">“{note.messages[0].replace('{name}', profile.name)}”</p>
            <span className="text-link">
              Read note <ArrowRight size={16} />
            </span>
          </Link>
        )}

        {/* Next milestone */}
        {next && (
          <Link to="/progress?tab=milestones" className="card card--hover dash-mile" data-reveal="up">
            <p className="eyebrow">Next milestone</p>
            <AchievementBadge achievement={next.achievement} unlocked={false} progress={next.progress} size={72} />
            <b>{next.achievement.name}</b>
            <span className="dash-mile__bar">
              <i style={{ transform: `scaleX(${next.progress})` }} />
            </span>
            <small>
              {next.value} / {next.achievement.target}
            </small>
          </Link>
        )}

        {/* Knowledge tip */}
        <Link to={`/learn/${tip.slug}`} className="card card--hover dash-tip" data-reveal="up">
          <p className="eyebrow">
            <BookOpen size={13} /> Two-minute read
          </p>
          <b>{tip.title}</b>
          <p>{tip.excerpt}</p>
          <span className="text-link">
            Read it <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </div>
  );
}
