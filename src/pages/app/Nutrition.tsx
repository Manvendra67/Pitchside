import { ChevronDown, Droplets, Info, Pencil } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { CheckDraw } from '@/components/CheckDraw';
import { Counter } from '@/components/Counter';
import { PageHeader } from '@/components/PageHeader';
import { WeightControl } from '@/components/Pickers';
import { ProgressRing } from '@/components/ProgressRing';
import { Segmented } from '@/components/Segmented';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toasts';
import { dateKey } from '@/lib/dates';
import { useDocumentTitle } from '@/lib/hooks';
import { EASE_IN_OUT, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { FUEL_UPS, fuelTargets, NUTRIENT_BY_ID, NUTRIENTS, SOURCES, TIMING, type DayType } from '@/lib/nutrition';
import { buildWeekPlan } from '@/lib/plan';
import { useReveal } from '@/lib/reveal';
import { actions, useStore } from '@/lib/store';
import '@/styles/pages.css';

/**
 * Fuel guide. Targets scale with body weight and the day type; every number
 * shows its working. Language stays on energy, recovery and growth — never
 * on dieting, calories or body shape.
 */
export default function Nutrition() {
  useDocumentTitle('Nutrition');
  const { profile, activity } = useStore();
  const toast = useToast();
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<HTMLOListElement>(null);
  useReveal(root);

  const todayKey = dateKey();
  const isTrainingToday = useMemo(() => buildWeekPlan(profile).sessions.some((s) => s.date === todayKey), [profile, todayKey]);
  const [day, setDay] = useState<DayType>(isTrainingToday ? 'training' : 'rest');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.weightKg);
  const [showMath, setShowMath] = useState(false);
  const targets = fuelTargets(profile.weightKg, day);
  const meals = activity[todayKey]?.meals ?? [];

  useGSAP(
    () => {
      if (prefersReducedMotion() || !timeline.current) return;
      gsap.fromTo(
        timeline.current.querySelector('.fuel-time__line path'),
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, ease: EASE_IN_OUT, duration: 1.4, scrollTrigger: { trigger: timeline.current, start: 'top 80%' } },
      );
    },
    { scope: root },
  );

  const saveWeight = () => {
    actions.updateProfile({ weightKg: draft });
    setEditing(false);
    toast({ title: 'Fuel guide updated', body: `Now sized for ${draft} kg.` });
  };

  return (
    <div ref={root} className="page nutrition">
      <PageHeader
        eyebrow="Fuel your game"
        title={
          <>
            Food is <span className="serif">fuel.</span>
          </>
        }
        sub={`Your daily guide for training, recovering and growing — sized for ${profile.weightKg} kg.`}
        actions={
          <>
            <Segmented
              label="Day type"
              size="lg"
              value={day}
              onChange={setDay}
              options={[
                { value: 'training', label: 'Training day' },
                { value: 'rest', label: 'Rest day' },
              ]}
            />
            <Button
              variant="secondary"
              size="lg"
              iconLeft={<Pencil size={16} />}
              onClick={() => {
                setDraft(profile.weightKg);
                setEditing(true);
              }}
            >
              {profile.weightKg} kg
            </Button>
          </>
        }
      />

      <div className="note fuel-note" role="note" data-reveal="up">
        <Info size={20} />
        <p>
          <strong>A guide, not a rule.</strong> These numbers are based on published youth sports nutrition guidance. They don’t replace
          advice from a parent, doctor, registered dietitian or other qualified professional. Growing bodies need plenty of food — if you’re
          hungry, eat.
        </p>
      </div>

      <div className="fuel-grid">
        {targets.map((t) => {
          const n = NUTRIENT_BY_ID[t.id];
          return (
            <article key={t.id} className="card fuel-card" style={{ ['--tone' as string]: `var(${n.tone})` }} data-reveal="up">
              <div className="fuel-card__head">
                <span className="fuel-card__swatch" aria-hidden="true" />
                <h2 className="fuel-card__name">{n.name}</h2>
                <span className="chip">{n.job}</span>
              </div>
              <div className="fuel-card__main">
                <p className="fuel-card__num">
                  <Counter value={t.grams} className="big-num" />
                  <span className="fuel-card__unit">g a day</span>
                </p>
                <ProgressRing
                  value={t.share}
                  size={84}
                  stroke={9}
                  color={`var(${n.tone})`}
                  animateIn
                  label={`${Math.round(t.share * 100)}% of your fuel`}
                >
                  <span className="fuel-card__pct">
                    <Counter value={Math.round(t.share * 100)} suffix="%" fromZero={false} />
                  </span>
                </ProgressRing>
              </div>
              <p className="fuel-card__math">
                {profile.weightKg} kg × {t.perKg} g = <b>{t.grams} g</b>
              </p>
              <p className="fuel-card__detail">{n.detail}</p>
              <ul className="fuel-card__foods" aria-label={`Foods with ${n.name.toLowerCase()}`}>
                {n.foods.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <section className="fuel-mix card" data-reveal="up" aria-labelledby="mix-title">
        <div className="card__head">
          <h2 id="mix-title" className="card__title">
            Your fuel mix
          </h2>
          <span className="muted fuel-mix__hint">How today’s energy is shared</span>
        </div>
        <div
          className="fuel-mix__bar"
          role="img"
          aria-label={targets.map((t) => `${NUTRIENT_BY_ID[t.id].short} ${Math.round(t.share * 100)}%`).join(', ')}
        >
          {targets.map((t) => (
            <span key={t.id} style={{ flexGrow: t.share, ['--tone' as string]: `var(${NUTRIENT_BY_ID[t.id].tone})` }}>
              <b>{NUTRIENT_BY_ID[t.id].short}</b> {Math.round(t.share * 100)}%
            </span>
          ))}
        </div>
      </section>

      <div className="fuel-row">
        <section className="card fuel-ups" data-reveal="up" aria-labelledby="fuelups-title">
          <div className="card__head">
            <h2 id="fuelups-title" className="card__title">
              Today’s fuel-ups
            </h2>
            <ProgressRing
              value={meals.length / FUEL_UPS.length}
              size={52}
              stroke={6}
              color="var(--pitch-400)"
              animateIn={false}
              label={`${meals.length} of ${FUEL_UPS.length} fuel-ups`}
            >
              <span className="fuel-ups__count">
                {meals.length}/{FUEL_UPS.length}
              </span>
            </ProgressRing>
          </div>
          <p className="muted fuel-ups__intro">Tick them off as you go. Regular meals keep your energy steady.</p>
          <ul className="fuel-ups__list">
            {FUEL_UPS.map((m) => {
              const on = meals.includes(m.id);
              return (
                <li key={m.id}>
                  <button type="button" className="fuel-up" aria-pressed={on} onClick={() => actions.toggleMeal(m.id)}>
                    <span className="fuel-up__box">
                      <CheckDraw done={on} size={18} />
                    </span>
                    <span className="fuel-up__text">
                      <b>{m.name}</b>
                      <small>{m.hint}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card fuel-water" data-reveal="up" aria-labelledby="water-title">
          <span className="fuel-water__icon" aria-hidden="true">
            <Droplets size={28} />
          </span>
          <h2 id="water-title" className="card__title">
            Water is part of your kit
          </h2>
          <p>Aim for 6–8 drinks across the day, plus extra when you train. Sip at every break — before you feel thirsty.</p>
          <div className="fuel-water__waves" aria-hidden="true">
            <svg viewBox="0 0 400 60" preserveAspectRatio="none">
              <path d="M0 30 Q 50 10 100 30 T 200 30 T 300 30 T 400 30 V60 H0Z" />
            </svg>
          </div>
        </section>
      </div>

      <section className="fuel-time" data-reveal="up" aria-labelledby="timing-title">
        <div className="section-title">
          <h2 id="timing-title">When to eat around training</h2>
        </div>
        <ol ref={timeline} className="fuel-time__list">
          <svg className="fuel-time__line" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 10 H1000" pathLength={1} strokeDasharray={1} />
          </svg>
          {TIMING.map((t, i) => (
            <li key={t.when} className="fuel-time__item" style={{ ['--i' as string]: i }}>
              <span className="fuel-time__dot" aria-hidden="true" />
              <p className="eyebrow">{t.when}</p>
              <b>{t.what}</b>
              <p className="muted">{t.example}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="fuel-how card" data-reveal="up">
        <button
          type="button"
          className="fuel-how__toggle"
          aria-expanded={showMath}
          aria-controls="fuel-math"
          onClick={() => setShowMath((v) => !v)}
        >
          <span>
            <b>How we worked this out</b>
            <small>For players, parents and coaches</small>
          </span>
          <ChevronDown size={22} className="fuel-how__chev" />
        </button>
        <div id="fuel-math" className="fuel-how__body" data-open={showMath || undefined} hidden={!showMath}>
          <table className="fuel-table">
            <thead>
              <tr>
                <th scope="col">Nutrient</th>
                <th scope="col">Training day</th>
                <th scope="col">Rest day</th>
                <th scope="col">What published guidance says</th>
              </tr>
            </thead>
            <tbody>
              {NUTRIENTS.map((n) => (
                <tr key={n.id}>
                  <th scope="row">{n.name}</th>
                  <td>{n.perKg.training} g per kg</td>
                  <td>{n.perKg.rest} g per kg</td>
                  <td>{n.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">
            We multiply your body weight by a value from the middle of each published range, then round to the nearest gram. Carbs ease a
            little on rest days; protein and fats stay steady because growing and recovering happen every day. With these values, fats land
            at roughly 25–35% of daily energy, in line with guidance for children and teens.
          </p>
          <h3 className="fuel-how__sources">Sources</h3>
          <ul className="fuel-sources">
            {SOURCES.map((s) => (
              <li key={s.title}>
                <b>{s.title}</b>
                <span>
                  {s.who} — {s.where}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Sheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Update body weight"
        description="Your fuel guide updates straight away. Only used to size your targets."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveWeight} data-autofocus>
              Save
            </Button>
          </>
        }
      >
        <div className="sheet-weight">
          <WeightControl value={draft} onChange={setDraft} id="sheet-weight" />
          <p className="muted">
            Carbs on a training day: <b>{fuelTargets(draft, 'training')[0].grams} g</b>
          </p>
        </div>
      </Sheet>
    </div>
  );
}
