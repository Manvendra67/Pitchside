import { ArrowLeft, ArrowRight, Check, Clock, Lightbulb } from 'lucide-react';
import { useRef } from 'react';
import { Link, useParams } from 'react-router';
import { ArticleArt } from '@/components/ArticleArt';
import { ButtonLink } from '@/components/Button';
import { ARTICLE_BY_SLUG, ARTICLES } from '@/data/articles';
import { COACH } from '@/data/coach';
import { useDocumentTitle } from '@/lib/hooks';
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';
import { actions, useStore } from '@/lib/store';
import '@/styles/pages.css';

/**
 * Editorial reader. A reading-progress bar tracks the article body, the
 * illustration comes into focus and drifts a little slower than the text,
 * and the article counts as read once you reach the takeaway.
 */
export default function Article() {
  const { slug = '' } = useParams();
  const article = ARTICLE_BY_SLUG[slug];
  const { readArticles } = useStore();
  const root = useRef<HTMLDivElement>(null);
  useDocumentTitle(article?.title ?? 'Article not found');
  useReveal(root, [slug]);

  useGSAP(
    () => {
      if (!article) return;
      const q = gsap.utils.selector(root);
      const bar = q('.read-progress i')[0];
      const body = q('.article__body')[0];
      ScrollTrigger.create({
        trigger: body,
        start: 'top 60%',
        end: 'bottom 70%',
        onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
      });
      ScrollTrigger.create({
        trigger: q('.article__takeaway')[0],
        start: 'top 85%',
        once: true,
        onEnter: () => actions.markArticleRead(article.slug),
      });
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        q('.article__art svg'),
        { scale: 1.15, filter: 'blur(14px)', opacity: 0.4 },
        { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 1.1, ease: 'pitch' },
      );
      gsap.to(q('.article__art svg'), {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: q('.article__art')[0], start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { scope: root, dependencies: [slug], revertOnUpdate: true },
  );

  if (!article) {
    return (
      <div className="page">
        <h1 className="page-head__title">We couldn’t find that article.</h1>
        <ButtonLink to="/learn" variant="primary" size="lg" iconLeft={<ArrowLeft size={18} />}>
          All articles
        </ButtonLink>
      </div>
    );
  }

  const i = ARTICLES.findIndex((a) => a.slug === slug);
  const next = ARTICLES[(i + 1) % ARTICLES.length];
  const read = readArticles.includes(slug);

  return (
    <div ref={root} className="page article" key={slug}>
      <div className="read-progress" aria-hidden="true">
        <i />
      </div>
      <Link to="/learn" className="back-link" data-reveal="fade">
        <ArrowLeft size={18} /> Football knowledge
      </Link>
      <header className="article__head">
        <p className="eyebrow" data-reveal="fade">
          {article.topic}
        </p>
        <h1 className="article__title" data-reveal="mask">
          {article.title}
        </h1>
        <p className="lede" data-reveal="up">
          {article.excerpt}
        </p>
        <p className="article__meta" data-reveal="up">
          <Clock size={15} /> {article.minutes} min read · Checked by {COACH.name}
          {read && (
            <span className="chip chip--volt">
              <Check size={13} strokeWidth={3} /> Read
            </span>
          )}
        </p>
      </header>
      <div className="article__art">
        <ArticleArt art={article.art} />
      </div>

      <div className="article__body">
        {article.sections.map((s) => (
          <section key={s.heading} className="article__section" data-reveal="up">
            <h2>{s.heading}</h2>
            {s.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {s.tip && (
              <aside className="article__tip">
                <Lightbulb size={18} />
                <p>
                  <b>Coach’s tip.</b> {s.tip}
                </p>
              </aside>
            )}
          </section>
        ))}
        <div className="article__takeaway" data-reveal="scale">
          <p className="eyebrow">Remember</p>
          <p className="article__takeaway-text">{article.takeaway}</p>
        </div>
      </div>

      <Link to={`/learn/${next.slug}`} className="article__next" data-cursor="Next">
        <div>
          <p className="eyebrow">Next read · {next.minutes} min</p>
          <p className="article__next-title">{next.title}</p>
        </div>
        <ArrowRight size={26} />
      </Link>
    </div>
  );
}
