import { ArrowRight, BookOpen, Check, CircleDot, Dumbbell, MessageSquare, TentTree, Waves } from 'lucide-react';
import { lazy, Suspense, type CSSProperties } from 'react';

const SkateboardLottie = lazy(() => import('./SkateboardLottie'));

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

type ActivityKind = typeof collegeActivities[number]['kind'];

function ActivityFigure({ kind }: { kind: ActivityKind }) {
  return <svg className={`college-life__figure college-life__figure--${kind}`} viewBox="0 0 320 286" role="img" aria-label={`Student ${kind}`}>
    <ellipse cx="160" cy="269" rx="114" ry="9" fill="#0b2d3524" />
    {kind === 'camping' && <g className="college-life__prop"><path d="M21 246 71 145l55 101Z" fill="#80b1a3" stroke="#1b5b56" strokeWidth="5" /><path d="m71 145 54 101H71Z" fill="#235b56" /><path d="M21 246h106" stroke="#18343d" strokeWidth="5" strokeLinecap="round" /><path d="m37 139 8-22 8 22M59 150l9-30 11 30" fill="none" stroke="#d1ad68" strokeWidth="4" strokeLinecap="round" /></g>}
    {kind === 'debating' && <g className="college-life__prop"><path d="M196 169h79l-13 87h-55Z" fill="#ccac71" stroke="#19444b" strokeWidth="4" /><path d="M214 169v-18a15 15 0 0 1 30 0" fill="none" stroke="#19444b" strokeWidth="4" /><circle cx="229" cy="148" r="5" fill="#19444b" /><path d="M258 92q25-18 38-2M256 108q32-3 42 16" fill="none" stroke="#8ec3b3" strokeWidth="5" strokeLinecap="round" /></g>}
    {kind === 'rowing' && <g className="college-life__prop"><path d="M19 237q102 26 281-1l-25 28H49Z" fill="#cbad72" stroke="#19444b" strokeWidth="4" /><path d="M45 269q15 7 30 0t30 0 30 0 30 0 30 0 30 0 30 0" fill="none" stroke="#77b9bf" strokeWidth="4" strokeLinecap="round" /><path d="m217 143 52 109" stroke="#784f35" strokeWidth="6" strokeLinecap="round" /><path d="m265 246 12 24" stroke="#784f35" strokeWidth="12" strokeLinecap="round" /></g>}
    {kind === 'polo' && <g className="college-life__prop"><path d="M28 230q23-35 67-28l33 25-17 25H53Z" fill="#b88961" stroke="#754932" strokeWidth="4" /><path d="m97 203 4-44 24-13 11 28-25 35" fill="#b88961" stroke="#754932" strokeWidth="4" /><circle cx="128" cy="167" r="3" fill="#18343d" /><path d="M235 149v99m0 0h-25" stroke="#6e4f3e" strokeWidth="5" strokeLinecap="round" /><circle cx="281" cy="250" r="9" fill="#faf7e6" stroke="#19444b" strokeWidth="3" /></g>}
    {kind === 'soccer' && <g className="college-life__prop"><circle cx="268" cy="245" r="24" fill="#fffdf5" stroke="#18343d" strokeWidth="3" /><path d="m268 231-10 8 4 12h13l4-12Z" fill="#18343d" /><path d="M243 239h12m28 0h9m-30 13-7 11m20-11 8 11" stroke="#18343d" strokeWidth="3" /></g>}
    {kind === 'rugby' && <g className="college-life__prop"><ellipse cx="234" cy="151" rx="30" ry="18" transform="rotate(-27 234 151)" fill="#bb7d4a" stroke="#73472f" strokeWidth="4" /><path d="m224 140 18 22m-8-30 17 22" stroke="#f7e9d7" strokeWidth="3" /></g>}
    {kind === 'sporting' && <g className="college-life__prop"><circle cx="260" cy="223" r="30" fill="#d49b65" stroke="#714b35" strokeWidth="4" /><path d="M232 216q31-21 54 5m-42 25q23-34 46-14m-33-38q-11 28 10 57" fill="none" stroke="#714b35" strokeWidth="3" /></g>}
    {kind === 'learning' && <g className="college-life__prop"><path d="M72 158q35-13 79 7v55q-45-18-79-7Zm79 7q45-20 94-7v55q-51-11-94 7Z" fill="#fffdf5" stroke="#c39f66" strokeWidth="4" /><path d="M151 165v55m-65-45 48 8m31 0 55-9" stroke="#b6b8a8" strokeWidth="3" /></g>}
    <g className="college-life__person">
      <path d="M139 235 129 265h-20l17-81m54 51 15 30h20l-17-82" fill="#1d3449" stroke="#1d3449" strokeWidth="5" strokeLinejoin="round" />
      <path d="M113 263h30m52 0h30" stroke="#f8f5e7" strokeWidth="8" strokeLinecap="round" />
      <path d="M132 112q26-10 56 3l15 79q-38 26-88 0Z" fill="#2b7770" stroke="#164c50" strokeWidth="4" />
      <path d="m136 114 23 23 25-22" fill="none" stroke="#a7d7b5" strokeWidth="5" strokeLinecap="round" />
      <path className="college-life__arm college-life__arm--left" d="M126 130q-21 21-32 48" fill="none" stroke="#2b7770" strokeWidth="18" strokeLinecap="round" />
      <path className="college-life__arm college-life__arm--right" d="M192 132q24 21 30 47" fill="none" stroke="#2b7770" strokeWidth="18" strokeLinecap="round" />
      <circle cx="93" cy="182" r="9" fill="#c98c68" /><circle cx="223" cy="181" r="9" fill="#c98c68" />
      <rect x="149" y="91" width="20" height="28" rx="8" fill="#c98c68" />
      <ellipse cx="160" cy="73" rx="28" ry="35" fill="#dba27b" />
      <path d="M132 69q-2-35 29-36 33 0 27 37-11-13-14-22-21 16-42 21Z" fill="#193844" />
      <circle cx="149" cy="76" r="2" fill="#193844" /><circle cx="172" cy="76" r="2" fill="#193844" />
      <path d="M151 90q10 8 20 0" fill="none" stroke="#8e563d" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>;
}

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
      <div className="college-life__visual" aria-hidden="true">
        <div className="college-life__scene" key={activity.kind}>
          {activity.kind === 'sporting' && import.meta.env.MODE !== 'test'
            ? <Suspense fallback={<ActivityFigure kind={activity.kind} />}><SkateboardLottie /></Suspense>
            : <ActivityFigure kind={activity.kind} />}
          <div className="college-life__scene-label"><Icon size={23} /><div><strong>{activity.label}</strong><span>{activity.detail}</span></div></div>
        </div>
      </div>
    </div>
  </div>;
}
