import { ArrowRight, BookOpen, Check, CircleDot, Dumbbell, MessageSquare, TentTree, Waves } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const collegeActivities = [
  { label: 'Learning', detail: 'New ideas to chase', Icon: BookOpen, kind: 'learning', asset: 'learning.lottie' },
  { label: 'Sporting', detail: 'Find your rhythm', Icon: Dumbbell, kind: 'sporting', asset: 'sporting.lottie' },
  { label: 'Debating', detail: 'Make your voice heard', Icon: MessageSquare, kind: 'debating', asset: 'debating.lottie' },
] as const;

const moreActivities = [
  { label: 'Rowing', Icon: Waves }, { label: 'Rugby', Icon: CircleDot },
  { label: 'Polo', Icon: CircleDot }, { label: 'Soccer', Icon: CircleDot },
  { label: 'Camping', Icon: TentTree },
] as const;

export function CollegeLifeTransition({ scene, onSkip }: { scene: number; onSkip: () => void }) {
  const activity = collegeActivities[scene] ?? collegeActivities[0];
  const Icon = activity.Icon;
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  return <div className="college-life" role="status" aria-live="polite" aria-label="Offer accepted! College life loading">
    <div className="college-life__confetti" aria-hidden="true">{Array.from({ length: 52 }, (_, index) => <i key={index} style={{ '--piece': index, '--left': `${(index * 37) % 100}%`, '--duration': `${2.1 + index % 6 * .21}s`, '--delay': `${index % 11 * .11}s`, '--drift': `${(index % 7 - 3) * 42}px` } as CSSProperties} />)}</div>
    <div className="college-life__layout">
      <div className="college-life__copy">
        <span className="college-life__accepted"><Check size={17} /> Offer accepted!</span>
        <h2>College life<br /><em>loading...</em></h2>
        <p>One yes. A whole world of possibilities.</p>
        <div className="college-life__progress" role="progressbar" aria-label="Loading college life" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((scene + 1) / collegeActivities.length * 100)}><span style={{ width: `${(scene + 1) / collegeActivities.length * 100}%` }} /></div>
        <div className="college-life__activity-list" aria-label="Campus life activities">{collegeActivities.map((item, index) => <span key={item.kind} className={index === scene ? 'is-active' : index < scene ? 'is-done' : ''}>{item.label}</span>)}</div>
        <p className="college-life__more">And more to discover: <span>{moreActivities.map((item) => <span key={item.label}><item.Icon size={12} aria-hidden="true" />{item.label}</span>)}</span></p>
        <button type="button" onClick={onSkip}>Continue to sign-in setup <ArrowRight size={18} /></button>
      </div>
      <div className="college-life__visual">
        <div className="college-life__scene" aria-hidden="true">
          <div className="college-life__animation-stage">{collegeActivities.map((item, index) => <div key={item.kind} className={`college-life__animation${index === scene ? ' is-active' : ''}`}>
            {!loaded[item.kind] && <span className="college-life__loading-mark">N</span>}
            <DotLottieReact className="college-life__lottie" src={`${import.meta.env.BASE_URL}animations/${item.asset}`} autoplay={!reducedMotion} loop dotLottieRefCallback={(player) => {
              player?.addEventListener('load', () => setLoaded((current) => ({ ...current, [item.kind]: true })));
            }} />
          </div>)}</div>
          <div className="college-life__scene-label"><Icon size={23} /><div><strong>{activity.label}</strong><span>{activity.detail}</span></div></div>
        </div>
      </div>
    </div>
  </div>;
}
