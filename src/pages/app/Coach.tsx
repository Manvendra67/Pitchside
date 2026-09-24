import { ArrowRight, BadgeCheck, Send, Sparkles } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Button } from '@/components/Button';
import { CheckDraw } from '@/components/CheckDraw';
import { PageHeader } from '@/components/PageHeader';
import { Segmented } from '@/components/Segmented';
import { FeedbackTag } from '@/components/Tags';
import { COACH, FEEDBACK_CHOICES, FEEDBACK_TIMELINE, notesFor, type CoachNote } from '@/data/coach';
import { DRILL_BY_ID, DRILLS } from '@/data/drills';
import { addDays, dateKey, formatShortDate, fromKey, relativeDay } from '@/lib/dates';
import { useDocumentTitle } from '@/lib/hooks';
import { EASE, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';
import { actions, useStore } from '@/lib/store';
import type { FeedbackChoice } from '@/lib/types';
import '@/styles/pages.css';

type Tab = 'notes' | 'ideas';

/* ── Coach notes ───────────────────────────────────────── */

function Message({ text, delay }: { text: string; delay: number }) {
  const el = useRef<HTMLParagraphElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion() || !el.current) return;
    gsap.from(el.current, { opacity: 0, y: 10, duration: 0.4, delay, ease: EASE });
    gsap.from(el.current.querySelectorAll('.word'), {
      opacity: 0,
      y: 4,
      filter: 'blur(3px)',
      duration: 0.35,
      stagger: 0.028,
      delay: delay + 0.05,
      ease: EASE,
    });
  });
  return (
    <p ref={el} className="bubble bubble--coach">
      {text.split(' ').map((w, i) => (
        <span key={i} className="word">
          {w}{' '}
        </span>
      ))}
    </p>
  );
}

/** Opening a note shows Coach Ranvir "typing", then the message reveals word by word. */
function NoteReader({ note, name }: { note: CoachNote; name: string }) {
  const [typing, setTyping] = useState(!prefersReducedMotion());
  const drill = note.drillId ? DRILL_BY_ID[note.drillId] : undefined;
  useEffect(() => {
    if (!typing) return;
    const id = window.setTimeout(() => setTyping(false), 900);
    return () => window.clearTimeout(id);
  }, [typing]);

  const date = dateKey(addDays(new Date(), -note.daysAgo));
  return (
    <article className="reader" aria-live="polite">
      <header className="reader__head">
        <span className="coach-badge__avatar reader__avatar">{COACH.initials}</span>
        <div>
          <b>{COACH.name}</b>
          <small>
            {note.topic} · {relativeDay(date)}
          </small>
        </div>
        <span className="reader__approved">
          <BadgeCheck size={16} /> Coach-approved
        </span>
      </header>
      <div className="reader__body">
        {typing ? (
          <p className="bubble bubble--coach bubble--typing" aria-label={`${COACH.name} is typing`}>
            <i />
            <i />
            <i />
          </p>
        ) : (
          note.messages.map((m, i) => <Message key={i} text={m.replace('{name}', name)} delay={i * 0.45} />)
        )}
        {!typing && drill && (
          <Link to={`/drills/${drill.id}`} className="reader__drill" style={{ animationDelay: `${note.messages.length * 0.45}s` }}>
            <Sparkles size={16} />
            <span>
              <small>Suggested drill</small>
              <b>{drill.name}</b>
            </span>
            <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </article>
  );
}

function Notes() {
  const { profile, openedNotes } = useStore();
  const notes = notesFor(profile.position);
  const [openId, setOpenId] = useState(notes[0]?.id);
  const reader = useRef<HTMLDivElement>(null);
  const open = notes.find((n) => n.id === openId) ?? notes[0];

  useEffect(() => {
    if (open) actions.markNoteOpened(open.id);
  }, [open]);

  const choose = (id: string) => {
    setOpenId(id);
    if (window.matchMedia('(max-width: 900px)').matches) {
      requestAnimationFrame(() => reader.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }));
    }
  };

  return (
    <div className="notes">
      <ul className="notes__list" aria-label="Notes from Coach Ranvir">
        {notes.map((n) => {
          const unread = !openedNotes.includes(n.id);
          return (
            <li key={n.id}>
              <button type="button" className="note-item" aria-current={n.id === open?.id || undefined} onClick={() => choose(n.id)}>
                <span className={`note-item__kind note-item__kind--${n.kind}`} aria-hidden="true" />
                <span className="note-item__text">
                  <b>{n.topic}</b>
                  <small>{n.messages[0].replace('{name}', profile.name)}</small>
                </span>
                <span className="note-item__meta">
                  {relativeDay(dateKey(addDays(new Date(), -n.daysAgo)))}
                  {unread && <i className="note-item__dot" aria-label="Unread" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div ref={reader} className="card notes__reader">
        {open && <NoteReader key={open.id} note={open} name={profile.name} />}
      </div>
    </div>
  );
}

/* ── Player feedback ───────────────────────────────────── */

function suggestionsFor(choices: FeedbackChoice[]) {
  const out: { label: string; to: string; drill?: string }[] = [];
  const add = (label: string, to: string, drill?: string) => !out.some((o) => o.to === to) && out.push({ label, to, drill });
  for (const c of choices) {
    if (c === 'more-finishing') add('Rebound Rush', '/drills/rebound-rush', 'rebound-rush');
    if (c === 'more-goalkeeper') add('Shuffle to Low Dive', '/drills/keeper-shuffle-dive', 'keeper-shuffle-dive');
    if (c === 'solo') add('Solo Passing Square', '/drills/solo-passing-square', 'solo-passing-square');
    if (c === 'more-1v1') add('Cone Gate 1v1', '/drills/cone-gate-1v1', 'cone-gate-1v1');
    if (c === 'harder') add('All advanced drills', '/drills?level=advanced');
    if (c === 'easier') add('All beginner drills', '/drills?level=beginner');
    if (c === 'more-passing') add('Passing drills', '/drills?category=passing');
    if (c === 'shorter') {
      const quick = DRILLS.filter((d) => d.duration <= 8)[0];
      if (quick) add(`${quick.name} (${quick.duration} min)`, `/drills/${quick.id}`, quick.id);
    }
  }
  return out.slice(0, 3);
}

const STATUS: Record<string, string> = { sent: 'With Coach Ranvir', reviewing: 'Being reviewed', added: 'Became a drill!' };

function Ideas() {
  const { feedback } = useStore();
  const [choices, setChoices] = useState<FeedbackChoice[]>([]);
  const [text, setText] = useState('');
  const [sent, setSent] = useState<FeedbackChoice[] | null>(null);
  const success = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sent || prefersReducedMotion() || !success.current) return;
      const q = gsap.utils.selector(success);
      gsap
        .timeline()
        .from(q('.idea-done__ring'), { scale: 0.6, opacity: 0, duration: 0.5, ease: 'settle' })
        .fromTo(
          q('.idea-done__ring circle[data-arc]'),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.6, ease: EASE },
          '-=0.3',
        )
        .from(q('[data-in]'), { y: 14, opacity: 0, stagger: 0.07, duration: 0.45, ease: EASE }, '-=0.2');
    },
    { dependencies: [sent] },
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!choices.length && !text.trim()) return;
    actions.submitFeedback(choices, text);
    setSent(choices);
    setChoices([]);
    setText('');
  };

  const toggle = (c: FeedbackChoice) => setChoices((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const suggestions = useMemo(() => (sent ? suggestionsFor(sent) : []), [sent]);

  return (
    <div className="ideas">
      <div className="card ideas__form-card">
        {sent ? (
          <div ref={success} className="idea-done" role="status">
            <span className="idea-done__ring" aria-hidden="true">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--surface-3)" strokeWidth="6" />
                <circle
                  data-arc
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="var(--volt-500)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <span className="idea-done__check">
                <CheckDraw done size={30} color="var(--pitch-600)" stroke={3} />
              </span>
            </span>
            <h2 className="h3" data-in>
              Sent to {COACH.name}!
            </h2>
            <p className="muted" data-in>
              Thanks — ideas like yours decide what gets built next. You’ll see the status change below.
            </p>
            {suggestions.length > 0 && (
              <div className="idea-done__sugg" data-in>
                <p className="eyebrow">Players asked for this before — try these now</p>
                <ul>
                  {suggestions.map((s) => (
                    <li key={s.to}>
                      <Link to={s.to} className="idea-sugg">
                        {s.drill && DRILL_BY_ID[s.drill]?.source.type === 'player-feedback' && <FeedbackTag label="From player feedback" />}
                        <b>{s.label}</b>
                        <ArrowRight size={16} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button variant="secondary" onClick={() => setSent(null)} data-in>
              Share another idea
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="ideas__form">
            <div>
              <h2 className="h3">What do you want more of?</h2>
              <p className="muted">Tap as many as you like. {COACH.name} reads every one.</p>
            </div>
            <div className="ideas__choices" role="group" aria-label="Feedback choices">
              {FEEDBACK_CHOICES.map((c) => {
                const on = choices.includes(c.id);
                return (
                  <button key={c.id} type="button" className="idea-choice" aria-pressed={on} onClick={() => toggle(c.id)}>
                    <span className="idea-choice__box">
                      <CheckDraw done={on} size={16} />
                    </span>
                    <span>
                      <b>{c.label}</b>
                      <small>{c.hint}</small>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="field">
              <label htmlFor="idea-text" className="field__label">
                Anything else? <span className="muted">(optional)</span>
              </label>
              <textarea
                id="idea-text"
                className="input"
                maxLength={140}
                value={text}
                placeholder="e.g. A drill I can do with my little brother"
                onChange={(e) => setText(e.target.value)}
              />
              <span className="field__hint">
                {140 - text.length} characters left · Please don’t include your full name or where you live.
              </span>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              iconLeft={<Send size={18} />}
              disabled={!choices.length && !text.trim()}
              magnetic
            >
              Send to {COACH.name}
            </Button>
          </form>
        )}
      </div>

      <div className="ideas__side">
        <section className="card" aria-labelledby="yours-title">
          <h2 id="yours-title" className="card__title">
            Your ideas
          </h2>
          {feedback.length === 0 ? (
            <p className="muted">Nothing sent yet. Your first idea unlocks the Team Voice milestone.</p>
          ) : (
            <ul className="idea-list">
              {feedback.map((f) => (
                <li key={f.id} className="idea-item" data-status={f.status}>
                  <span className="idea-item__status">{STATUS[f.status]}</span>
                  <b>
                    {f.choices
                      .map((c) => FEEDBACK_CHOICES.find((x) => x.id === c)?.label)
                      .filter(Boolean)
                      .join(', ') || 'Your idea'}
                  </b>
                  {f.text && <p>“{f.text}”</p>}
                  <small>{formatShortDate(new Date(f.at))}</small>
                  {f.resultDrillIds?.map((id) => (
                    <Link key={id} to={`/drills/${id}`} className="idea-item__result">
                      <Sparkles size={14} /> {DRILL_BY_ID[id]?.name} <ArrowRight size={14} />
                    </Link>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card" aria-labelledby="shaped-title">
          <h2 id="shaped-title" className="card__title">
            Built from player feedback
          </h2>
          <ol className="shaped">
            {FEEDBACK_TIMELINE.map((t) => {
              const d = DRILL_BY_ID[t.drillId];
              if (!d || d.source.type !== 'player-feedback') return null;
              return (
                <li key={t.drillId}>
                  <span className="shaped__dot" aria-hidden="true" />
                  <small>{formatShortDate(fromKey(d.source.addedOn))}</small>
                  <p>
                    <b>{t.players} players</b> asked for “{t.request.toLowerCase()}”
                  </p>
                  <Link to={`/drills/${d.id}`} className="text-link">
                    {d.name} <ArrowRight size={14} />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}

export default function Coach() {
  useDocumentTitle('Coach & Feedback');
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'ideas' ? 'ideas' : 'notes';
  const { profile, openedNotes } = useStore();
  const unread = notesFor(profile.position).filter((n) => !openedNotes.includes(n.id)).length;
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useReveal(root, [tab]);

  useLayoutEffect(() => {
    if (!panel.current || prefersReducedMotion()) return;
    gsap.fromTo(panel.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.36, ease: EASE, clearProps: 'transform' });
  }, [tab]);

  return (
    <div ref={root} className="page coach">
      <PageHeader
        eyebrow="Coach & feedback"
        title={
          <>
            Notes from <span className="serif">your coach.</span>
          </>
        }
        sub={`Short, encouraging notes approved by ${COACH.name} — and a place to tell ${COACH.name} what you want to train next.`}
      />
      <Segmented
        role="tablist"
        idBase="coach"
        label="Coach sections"
        size="lg"
        value={tab}
        onChange={(t) => setParams(t === 'notes' ? {} : { tab: t }, { replace: true, preventScrollReset: true })}
        options={[
          { value: 'notes', label: 'Coach notes', count: unread || undefined },
          { value: 'ideas', label: 'Share an idea' },
        ]}
        className="progress__tabs"
      />
      <div ref={panel} role="tabpanel" id={`coach-panel-${tab}`} aria-labelledby={`coach-tab-${tab}`}>
        {tab === 'notes' ? <Notes /> : <Ideas />}
      </div>
    </div>
  );
}
