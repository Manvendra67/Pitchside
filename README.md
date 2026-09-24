# Pitchside

**Train smarter. Eat better. Improve every day.**

Pitchside is a football development platform for young players aged 8–13, and a useful companion for their parents and coaches. It combines a cinematic marketing site with a working product: onboarding, a personal dashboard, a coach-reviewed drill library, a body-weight-scaled fuel guide, progress tracking, a weekly plan, coach feedback, player feedback, milestones and short football-knowledge reads.

Everything runs in the browser. Player data is stored only in `localStorage` on the player's device: there are no accounts, no ads and no tracking.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm test           # domain unit tests (Vitest)
npm run format     # Prettier
```

The app is a single-page app. When you deploy it, make every path fall back to `index.html`. `public/_redirects` (Netlify) and `vercel.json` (Vercel) already do this.

## The player's journey

The whole product is built around five questions:

| Question | Where it lives |
| --- | --- |
| Who am I as a player? | Onboarding (`/start`), Profile (`/profile`) |
| What should I fuel with? | Nutrition (`/nutrition`) |
| What should I train? | Training Plan (`/plan`), Drills (`/drills`) |
| Did I complete it? | Daily check-in and drill timer (Dashboard, Drill detail) |
| Am I improving? | Progress (`/progress`): overview, calendar, milestones |

Before onboarding, the app shows a sample player called **Sam** with a few weeks of training history, so every screen looks complete. Onboarding keeps that sample history so a new player can explore straight away. **Profile → Your data → Clear sample history** starts the player's own record from today.

## Tech

- **React 19 + TypeScript + Vite**, with every route code-split. The other screens prefetch once the first screen is idle.
- **GSAP 3** (ScrollTrigger, Flip, CustomEase) through `@gsap/react`'s `useGSAP`, so every animation is scoped and cleaned up.
- **Lenis** for smooth inertial scrolling. GSAP's ticker drives Lenis, so ScrollTrigger and Lenis read the same scroll position on the same frame.
- Fonts are bundled locally with Fontsource, so no third-party requests are made: **Archivo** (variable width) for display, **Geist** for UI, **Geist Mono** for data labels and **Instrument Serif** italic for editorial accents.
- **lucide-react** icons, plus custom football glyphs (ball, cone, whistle, boot).

```
src/
  data/         drills, positions & categories, articles, coach notes, sample player
  lib/          store, nutrition maths, plan generator, stats & streaks,
                achievements, drill filtering, motion system, reveal system
  components/   design-system pieces: Button, Segmented, ProgressRing, Counter,
                DrillCard, DrillDiagram, Sheet, Toasts, Cursor, Portal, IntroLoader…
  pages/home/   marketing experience (hero, scroll story, pinned sections, footer)
  pages/app/    product screens
  styles/       tokens, base, components, app shell, home, pages, onboarding
```

## Motion system

The motion system follows a strict hierarchy: smooth scroll → scroll-scrubbed sequences → section transitions → element reveals → micro-interactions → ambient motion.

- Everything uses one signature curve, `cubic-bezier(0.22, 1, 0.36, 1)` (registered in GSAP as `pitch`), plus `settle` for small overshoot-and-settle moments.
- Durations are set in `src/lib/motion.ts`: micro-interactions 120–220 ms, hovers ~220 ms, panels ~340 ms, entrances ~460 ms and section moves ~640 ms.
- Animations use transform and opacity (plus the odd clip-path or stroke). Scroll-driven sequences scrub, so they reverse when you scroll back up.
- **Reduced motion:** Lenis is switched off, pinned sequences become static stacked layouts, the custom cursor is removed, and transitions collapse to near-instant.
- **Lite devices** (phones, low memory or data-saver): the particle count drops, cursor effects are off and the horizontal pinned section becomes a native swipe carousel.

Home-page set pieces:

- a logo-reveal intro
- a 3D tactics-board hero with cursor parallax and slow camera drift
- scroll-scrubbed editorial typography with ghost words and a chalk curtain
- a pinned "living window" that morphs through the five journey states
- a pinned horizontal sequence with a ball that rolls in step with scroll distance
- velocity-reactive marquees
- a centre-circle portal that opens into the dashboard

## Nutrition

Targets are grams per kilogram of body weight. Each value comes from the middle of the range in published youth and sports nutrition guidance:

| Nutrient | Training day | Rest day |
| --- | --- | --- |
| Carbohydrates | 7 g/kg | 6 g/kg |
| Protein | 1.5 g/kg | 1.5 g/kg |
| Healthy fats | 1.5 g/kg | 1.5 g/kg |

With these values, fat stays inside 25–35% of daily energy, and a unit test enforces this. Sources are listed in the app under **Nutrition → How we worked this out**:

- Desbrow B. et al., *Sports Dietitians Australia position statement: Sports nutrition for the adolescent athlete*, IJSNEM (2014)
- Collins J. et al., *UEFA expert group statement on nutrition in elite football*, BJSM (2021)
- Thomas, Erdman & Burke, *Nutrition and Athletic Performance* (AND / DC / ACSM joint position, 2016)
- Institute of Medicine, *Dietary Reference Intakes: Acceptable Macronutrient Distribution Ranges* (2005)

The fuel guide never uses dieting, calorie-restriction, weight-loss or body-image language. A visible note says the guidance does not replace a parent, doctor, registered dietitian or other qualified professional.

## Adding drills

All drills live in `src/data/drills.ts`, and every drill is reviewed by Coach Ranvir. To add a drill:

1. Append a `defineDrill({...})` entry to `CORE_DRILLS`. If players asked for the drill, add it to `FEEDBACK_DRILLS` with a `source` like this:

   ```ts
   source: { type: 'player-feedback', request: 'More goalkeeper drills', requests: 11, addedOn: '2026-09-10' }
   ```

2. Give it a small `diagram`: cones, a movement path and player positions in a 100 × 64 box.
3. That's it. The library, filters, search, weekly-plan generator, drill detail page and the "New from player feedback" labels all pick it up automatically. To show a feedback drill on the Coach page's "Built from player feedback" timeline, add it to `FEEDBACK_TIMELINE` in `src/data/coach.ts`.

## Safety by design

- No heading practice, in line with youth football guidance on heading.
- Rest-day check-ins keep your streak going, because recovery is part of training.
- Sessions are short (about 15–35 minutes, including warm-up and cool-down).
- Diving drills are only for grass or a soft mat.
- Coach notes are pre-approved. There is no open chat, and the player-feedback field asks players not to share personal details.

## Accessibility

- Semantic landmarks and headings, with a skip link.
- Visible focus rings, roving focus in radio groups and tabs, and focus-trapped modals and drawers.
- Labelled form fields, and live regions for toasts and timers.
- Large touch targets throughout.
- Every route passes an axe-core scan on desktop and phone.
