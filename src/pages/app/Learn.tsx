import { ArrowUpRight, Check, Clock } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArticleArt } from '@/components/ArticleArt';
import { PageHeader } from '@/components/PageHeader';
import { Segmented } from '@/components/Segmented';
import { ARTICLES, type ArticleTopic } from '@/data/articles';
import { useDocumentTitle } from '@/lib/hooks';
import { EASE, Flip, gsap, prefersReducedMotion } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';
import { useStore } from '@/lib/store';
import '@/styles/pages.css';

const TOPICS: ('All' | ArticleTopic)[] = ['All', 'Fundamentals', 'Nutrition', 'Recovery', 'Teamwork', 'Warm-ups', 'Habits'];

export default function Learn() {
  useDocumentTitle('Football Knowledge');
  const { readArticles } = useStore();
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('All');
  const grid = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const change = (t: typeof topic) => {
    if (grid.current && !prefersReducedMotion()) flip.current = Flip.getState(grid.current.children);
    setTopic(t);
  };

  useLayoutEffect(() => {
    if (!flip.current) return;
    Flip.from(flip.current, {
      duration: 0.55,
      ease: EASE,
      absolute: true,
      scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.4, ease: EASE }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.25, ease: 'power2.in' }),
    });
    flip.current = null;
  }, [topic]);

  const [lead, ...rest] = ARTICLES;
  const showLead = topic === 'All';

  return (
    <div ref={root} className="page learn">
      <PageHeader
        eyebrow="Football knowledge"
        title={
          <>
            Know the <span className="serif">game.</span>
          </>
        }
        sub={`Short reads about skills, food, rest and being a great teammate. You’ve read ${readArticles.length} of ${ARTICLES.length}.`}
      />

      {showLead && (
        <Link to={`/learn/${lead.slug}`} className="learn-lead" data-reveal="up" data-cursor="Read">
          <div className="learn-lead__art">
            <ArticleArt art={lead.art} />
          </div>
          <div className="learn-lead__text">
            <p className="eyebrow">
              Featured · {lead.topic} · {lead.minutes} min read
            </p>
            <h2 className="learn-lead__title">{lead.title}</h2>
            <p className="lede">{lead.excerpt}</p>
            <span className="text-link">
              Start reading <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>
      )}

      <Segmented
        label="Topic"
        scroll
        tone="ghost"
        value={topic}
        onChange={change}
        options={TOPICS.map((t) => ({ value: t, label: t }))}
        className="learn-topics"
      />

      <div ref={grid} className="learn-grid">
        {(showLead ? rest : ARTICLES).map((a) => {
          const hidden = topic !== 'All' && a.topic !== topic;
          const read = readArticles.includes(a.slug);
          return (
            <Link key={a.slug} to={`/learn/${a.slug}`} className="learn-card" data-flip-id={a.slug} hidden={hidden} data-cursor="Read">
              <div className="learn-card__art">
                <ArticleArt art={a.art} />
                {read && (
                  <span className="learn-card__read">
                    <Check size={13} strokeWidth={3} /> Read
                  </span>
                )}
              </div>
              <div className="learn-card__text">
                <p className="eyebrow">{a.topic}</p>
                <h3 className="learn-card__title">{a.title}</h3>
                <p className="learn-card__excerpt">{a.excerpt}</p>
                <span className="learn-card__meta">
                  <Clock size={14} /> {a.minutes} min read
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
