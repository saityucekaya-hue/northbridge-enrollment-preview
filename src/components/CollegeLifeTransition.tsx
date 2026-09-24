import { ArrowRight, BookOpen, Check, CircleDot, Dumbbell, MessageSquare, TentTree, Waves } from 'lucide-react';
import { type CSSProperties } from 'react';
import { StudentActivityScene } from './StudentActivityScene';

export const collegeActivities = [
  { label: 'Learning', detail: 'New ideas to chase', Icon: BookOpen, kind: 'learning' },
  { label: 'Sporting', detail: 'Find your rhythm', Icon: Dumbbell, kind: 'sporting' },
  { label: 'Debating', detail: 'Make your voice heard', Icon: MessageSquare, kind: 'debating' },
  { label: 'Rowing', detail: 'Move together', Icon: Waves, kind: 'rowing' },
  { label: 'Rugby', detail: 'Play with heart', Icon: CircleDot, kind: 'rugby' },
  { label: 'Polo', detail: 'Try something new', Icon: CircleDot, kind: 'polo' },
  { label: 'Soccer', detail: 'Find your team', Icon: CircleDot, kind: 'soccer' },
  { label: 'Camping', detail: 'Explore further', Icon: TentTree, kind: 'camping' },
] as const;

export function CollegeLifeTransition({ scene, onSkip }: { scene: number; onSkip: () => void }) {
  const activity = collegeActivities[scene] ?? collegeActivities[0];
  const Icon = activity.Icon;
  return <div className="college-life" role="status" aria-live="polite" aria-label="Offer accepted! College life loading">
    <div className="college-life__confetti" aria-hidden="true">{Array.from({ length: 52 }, (_, index) => <i key={index} style={{ '--piece': index, '--left': `${(index * 37) % 100}%`, '--duration': `${2.1 + index % 6 * .21}s`, '--delay': `${index % 11 * .11}s`, '--drift': `${(index % 7 - 3) * 42}px` } as CSSProperties} />)}</div>
    <div className="college-life__layout">
      <div className="college-life__copy">
        <span className="college-life__accepted"><Check size={17} /> Offer accepted!</span>
        <h2>College life<br /><em>loading...</em></h2>
        <p>One yes. A whole world of possibilities.</p>
        <div className="college-life__progress" role="progressbar" aria-label="Loading college life" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((scene + 1) / collegeActivities.length * 100)}><span style={{ width: `${(scene + 1) / collegeActivities.length * 100}%` }} /></div>
        <div className="college-life__activity-list" aria-hidden="true">{collegeActivities.map((item, index) => <span key={item.kind} className={index === scene ? 'is-active' : index < scene ? 'is-done' : ''}>{item.label}</span>)}</div>
        <button type="button" onClick={onSkip}>Continue to sign-in setup <ArrowRight size={18} /></button>
      </div>
      <div className="college-life__visual">
        <div className="college-life__scene" key={activity.kind} aria-hidden="true">
          <StudentActivityScene activity={activity.kind} />
          <div className="college-life__scene-label"><Icon size={23} /><div><strong>{activity.label}</strong><span>{activity.detail}</span></div></div>
        </div>
      </div>
    </div>
  </div>;
}
