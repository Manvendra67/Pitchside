import { HeartHandshake, Lock, ShieldCheck, Utensils } from 'lucide-react';
import { useRef } from 'react';
import { COACH } from '@/data/coach';
import { useReveal } from '@/lib/reveal';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Coach-reviewed',
    body: `Every drill, plan and note is checked by ${COACH.name} before it reaches a player.`,
  },
  {
    icon: Utensils,
    title: 'Fuel, not diets',
    body: 'Nutrition is about energy, recovery and growth. No calorie counting. No weight-loss talk. Ever.',
  },
  {
    icon: Lock,
    title: 'Private by design',
    body: 'No ads, no public profiles, no chat with strangers. Progress is saved on the player’s own device.',
  },
];

const SAFETY = [
  'No heading practice, in line with youth football guidance',
  'Rest days count towards streaks — recovery is training too',
  'Short sessions: roughly 15–35 minutes, warm-up included',
  'Diving drills only on grass or a soft mat',
  'Clear prompts to check with a parent, doctor or dietitian',
];

export function ForParents() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section ref={root} className="parents" aria-labelledby="parents-title">
      <div className="container">
        <div className="parents__head">
          <p className="eyebrow" data-reveal="fade">
            For parents & coaches
          </p>
          <h2 id="parents-title" className="display" data-reveal="mask">
            Built for young players. <em className="serif">Trusted by grown-ups.</em>
          </h2>
        </div>
        <div className="parents__grid">
          {PILLARS.map((p) => (
            <article key={p.title} className="parents__pillar" data-reveal="up">
              <span className="parents__icon">
                <p.icon size={22} />
              </span>
              <h3 className="h3">{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
        <div className="parents__row">
          <article className="coach-card" data-reveal="scale">
            <div className="coach-card__top">
              <span className="coach-card__avatar">{COACH.initials}</span>
              <div>
                <b>{COACH.name}</b>
                <span>{COACH.role}</span>
              </div>
              <span className="coach-card__seal">
                <HeartHandshake size={18} /> Reviewer
              </span>
            </div>
            <blockquote>“I want every player to leave a session a little better — and a lot happier.”</blockquote>
            <p>{COACH.bio}</p>
          </article>
          <div className="parents__safety" data-reveal="up">
            <p className="eyebrow">Safe by default</p>
            <ul>
              {SAFETY.map((s) => (
                <li key={s}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <circle cx="12" cy="12" r="11" fill="var(--pitch-100)" />
                    <path
                      d="M7 12.5l3.2 3.2L17 9"
                      fill="none"
                      stroke="var(--pitch-500)"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
