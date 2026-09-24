import { Download, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/AppLayout';
import { Button, ButtonLink } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { AgePicker, DayPicker, GoalPicker, LevelPicker, PositionPicker, WeightControl } from '@/components/Pickers';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toasts';
import { LEVEL_BY_ID, POSITION_BY_ID } from '@/data/positions';
import { useDocumentTitle } from '@/lib/hooks';
import { fuelTargets, NUTRIENT_BY_ID } from '@/lib/nutrition';
import { useReveal } from '@/lib/reveal';
import { actions, getState, useStore } from '@/lib/store';
import type { PlayerProfile } from '@/lib/types';
import '@/styles/pages.css';

/**
 * Profile. Every change saves as you make it; weight changes immediately
 * re-size the fuel guide (shown live, right here).
 */
export default function Profile() {
  useDocumentTitle('Profile');
  const { profile, hasSampleHistory } = useStore();
  const toast = useToast();
  const root = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(profile.name);
  const [confirm, setConfirm] = useState<'clear' | 'reset' | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  useReveal(root);

  useEffect(() => setName(profile.name), [profile.name]);

  const save = (patch: Partial<PlayerProfile>, quiet = false) => {
    actions.updateProfile({ ...patch, isDemo: false });
    if (quiet) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => toast({ title: 'Saved', body: 'Your profile is up to date.' }), 500);
  };

  const fuel = fuelTargets(profile.weightKg, 'training');

  const exportData = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pitchside-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={root} className="page profile">
      <PageHeader
        eyebrow="Profile"
        title={
          <>
            Who you are <span className="serif">as a player.</span>
          </>
        }
        sub="Change anything, any time. Pitchside updates your plan, drills and fuel guide straight away."
      />

      <section className="card card--dark theme-dark profile-hero" data-reveal="up">
        <Avatar name={profile.name} size={88} />
        <div className="profile-hero__text">
          <label htmlFor="profile-name" className="eyebrow">
            Player name
          </label>
          <input
            id="profile-name"
            className="profile-hero__name"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && name.trim() !== profile.name && save({ name: name.trim() })}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          />
          <p>
            {POSITION_BY_ID[profile.position].name} · {LEVEL_BY_ID[profile.level].name}
            {profile.age ? ` · ${profile.age} years old` : ''}
          </p>
        </div>
        <ButtonLink to="/start" variant="secondary" size="md" iconLeft={<RotateCcw size={16} />}>
          Redo set-up
        </ButtonLink>
      </section>

      <section className="profile-section" data-reveal="up" aria-labelledby="pos-title">
        <h2 id="pos-title" className="profile-section__title">
          Position
        </h2>
        <PositionPicker value={profile.position} onChange={(position) => save({ position })} />
      </section>

      <section className="profile-section" data-reveal="up" aria-labelledby="lvl-title">
        <h2 id="lvl-title" className="profile-section__title">
          Skill level
        </h2>
        <LevelPicker value={profile.level} onChange={(level) => save({ level })} />
      </section>

      <section className="profile-section profile-body" data-reveal="up" aria-labelledby="body-title">
        <div>
          <h2 id="body-title" className="profile-section__title">
            Body weight
          </h2>
          <p className="muted">Only used to size your fuel guide. It never leaves this device.</p>
          <WeightControl value={profile.weightKg} onChange={(weightKg) => save({ weightKg }, true)} id="profile-weight" />
        </div>
        <div className="card profile-fuel">
          <p className="eyebrow">Training-day fuel</p>
          {fuel.map((t) => (
            <p key={t.id} className="profile-fuel__row" style={{ ['--tone' as string]: `var(${NUTRIENT_BY_ID[t.id].tone})` }}>
              <i aria-hidden="true" />
              {NUTRIENT_BY_ID[t.id].short}
              <b>{t.grams} g</b>
            </p>
          ))}
          <ButtonLink to="/nutrition" variant="ghost" size="sm">
            Open fuel guide
          </ButtonLink>
        </div>
      </section>

      <section className="profile-section" data-reveal="up" aria-labelledby="days-title">
        <h2 id="days-title" className="profile-section__title">
          Training days
        </h2>
        <DayPicker value={profile.trainingDays} onChange={(trainingDays) => save({ trainingDays })} />
      </section>

      <div className="profile-two" data-reveal="up">
        <section className="profile-section" aria-labelledby="age-title">
          <h2 id="age-title" className="profile-section__title">
            Age <span className="muted">(optional)</span>
          </h2>
          <AgePicker value={profile.age} onChange={(age) => save({ age })} />
        </section>
        <section className="profile-section" aria-labelledby="goals-title">
          <h2 id="goals-title" className="profile-section__title">
            Goals <span className="muted">(optional)</span>
          </h2>
          <GoalPicker value={profile.goals} onChange={(goals) => save({ goals })} />
        </section>
      </div>

      <section className="card profile-data" data-reveal="up" aria-labelledby="data-title">
        <div className="profile-data__head">
          <ShieldCheck size={22} />
          <div>
            <h2 id="data-title" className="card__title">
              Your data
            </h2>
            <p className="muted">Everything is stored on this device only. No account, no ads, nothing shared.</p>
          </div>
        </div>
        <div className="profile-data__actions">
          <Button variant="secondary" iconLeft={<Download size={16} />} onClick={exportData}>
            Download my data
          </Button>
          {hasSampleHistory && (
            <Button variant="secondary" iconLeft={<Trash2 size={16} />} onClick={() => setConfirm('clear')}>
              Clear sample history
            </Button>
          )}
          <Button variant="ghost" iconLeft={<RotateCcw size={16} />} onClick={() => setConfirm('reset')}>
            Reset Pitchside
          </Button>
        </div>
        {hasSampleHistory && (
          <p className="profile-data__note">
            Pitchside starts with a few weeks of sample training so you can explore. Clear it to start your own record from today.
          </p>
        )}
      </section>

      <Sheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === 'reset' ? 'Reset Pitchside?' : 'Clear sample history?'}
        description={
          confirm === 'reset'
            ? 'This removes your profile and history from this device and brings back the sample player.'
            : 'Your profile stays. Streaks, calendar and milestones start fresh from today.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)} data-autofocus>
              Keep it
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (confirm === 'reset') actions.resetAll();
                else actions.clearSampleHistory();
                setConfirm(null);
                toast({
                  title: confirm === 'reset' ? 'Pitchside reset' : 'Fresh start',
                  body: confirm === 'reset' ? 'Sample player restored.' : 'Your record starts today.',
                });
              }}
            >
              {confirm === 'reset' ? 'Reset' : 'Clear history'}
            </Button>
          </>
        }
      >
        <p className="muted">You can’t undo this.</p>
      </Sheet>
    </div>
  );
}
