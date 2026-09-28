import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, X } from 'lucide-react';
import { MyEnrollment } from './MyEnrollment';
import '../enrollment-walkthrough.css';

const steps = [
  { target: '.en-hero-copy', title: 'Your next chapter starts here', text: 'This is your enrollment checklist. Upload documents, set your preferences, and watch your progress grow as each step is completed.' },
  { target: '.en-group--todo .en-task', title: 'Start with your ToDo list', text: 'Each card tells you what to do, how long it may take, and the points you can earn. Use its action button to open the task. An Action needed label marks a step that needs your attention.' },
  { target: '.en-quick-filters', title: 'Find the tasks you need', text: 'Action needed shows only flagged tasks—not every ToDo. In review and Done show those stages. Choose All tasks to bring everything back.' },
  { target: '.en-sort-picker', title: 'Choose what comes first', text: 'Smart orders tasks by deadlines and dependencies. Due Soon puts the nearest deadlines first; Fastest puts shorter tasks first. Sorting keeps tasks in their status groups.' },
  { target: '.en-group--review .en-group-heading', title: 'Submitted and being checked', text: 'In Review holds work you have submitted for Admissions to check. Submitting a document does not mean it is approved yet. Use View submission to see its details.' },
  { target: '.en-group--done .en-group-heading', title: 'See how far you have come', text: 'Done holds your completed steps. These add to your progress and earned points. You can still open a completed task to see its details.' },
  { target: '.en-calendar', title: 'Keep an eye on deadlines', text: 'Dates with a small dot have an enrollment deadline. Select a date, then use the task link below the calendar to open the matching step.' },
  { target: '.en-help', title: 'A little help along the way', text: 'Visit the help center when you are unsure about a step. You are ready to explore—your tasks and progress have stayed exactly as they were.' },
] as const;

type Position = { x: number; y: number; width: number; height: number; cardX: number; cardY: number };

function exitTour() {
  window.location.assign(window.location.hash === '#my-enrollment-walkthrough'
    ? `${import.meta.env.BASE_URL}#my-enrollment`
    : `${import.meta.env.BASE_URL}my-enrollment`);
}

export function EnrollmentWalkthrough() {
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState<Position | null>(null);
  const [moving, setMoving] = useState(false);
  const lastPosition = useRef<Position | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const card = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = steps[step];
  const ready = position !== null;

  useEffect(() => { document.title = 'Enrollment walkthrough · Northbridge University'; }, []);
  useEffect(() => { if (ready && !moving) heading.current?.focus({ preventScroll: true }); }, [step, ready, moving]);

  useLayoutEffect(() => {
    dialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useLayoutEffect(() => {
    const target = document.querySelector<HTMLElement>(current.target);
    let frame = 0;
    let animation = 0;
    let animating = false;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    function geometry(): Position | null {
      if (!target || !card.current) return null;
      const rect = target.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardWidth = card.current.offsetWidth;
      const cardHeight = card.current.offsetHeight;
      const mobile = vw <= 1190;
      let cardX = Math.max(16, Math.min(vw - cardWidth - 16, rect.left));
      let cardY = rect.bottom + 22;
      if (mobile) {
        cardX = (vw - cardWidth) / 2;
        cardY = vh - cardHeight - 16;
      } else if (vw - rect.right >= cardWidth + 40) {
        cardX = rect.right + 24;
        cardY = Math.max(20, Math.min(vh - cardHeight - 20, rect.top));
      } else if (rect.left >= cardWidth + 40) {
        cardX = rect.left - cardWidth - 24;
        cardY = Math.max(20, Math.min(vh - cardHeight - 20, rect.top));
      } else if (cardY + cardHeight > vh - 16) {
        cardY = Math.max(16, rect.top - cardHeight - 22);
      }
      const x = Math.max(8, rect.left - 8);
      const y = Math.max(vw <= 849 ? 66 : 8, rect.top - 8);
      const right = Math.min(vw - 8, rect.right + 8);
      const bottom = Math.min(mobile ? cardY - 18 : vh - 8, rect.bottom + 8);
      return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y), cardX, cardY };
    }
    function commit(next: Position | null) {
      if (next && !disposed) { lastPosition.current = next; setPosition(next); }
    }
    function measure() { commit(geometry()); }
    function schedule() {
      if (!disposed && !animating) { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); }
    }
    function reveal() {
      if (!target) return;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(animation);
      const rect = target.getBoundingClientRect();
      const startScroll = window.scrollY;
      const anchor = window.innerWidth <= 1190 ? 92 : (window.innerHeight - rect.height) / 2;
      const endScroll = Math.max(0, Math.min(document.documentElement.scrollHeight - window.innerHeight, startScroll + rect.top - anchor));
      const startPosition = lastPosition.current;
      if (motion.matches || !startPosition) {
        animating = false; setMoving(false);
        window.scrollTo({ top: endScroll, behavior: 'instant' }); measure(); return;
      }
      animating = true; setMoving(true);
      const started = performance.now();
      const duration = Math.min(950, 600 + Math.abs(endScroll - startScroll) * .18);
      function tick(now: number) {
        if (disposed) return;
        const progress = Math.min(1, (now - started) / duration);
        const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        window.scrollTo({ top: startScroll + (endScroll - startScroll) * eased, behavior: 'instant' });
        const destination = geometry();
        if (destination && startPosition) {
          const next = { ...destination };
          for (const key of Object.keys(next) as (keyof Position)[]) next[key] = startPosition[key] + (destination[key] - startPosition[key]) * eased;
          commit(next);
        }
        if (progress < 1) animation = requestAnimationFrame(tick);
        else { animating = false; measure(); setMoving(false); }
      }
      animation = requestAnimationFrame(tick);
    }
    reveal();
    const observer = new ResizeObserver(schedule);
    if (target) observer.observe(target);
    if (card.current) observer.observe(card.current);
    window.addEventListener('resize', reveal);
    motion.addEventListener('change', reveal);
    window.addEventListener('scroll', schedule, true);
    void document.fonts.ready.then(schedule);
    return () => {
      disposed = true;
      observer.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(animation);
      motion.removeEventListener('change', reveal);
      window.removeEventListener('resize', reveal);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [current]);

  return <><div className="en-walkthrough-page"><MyEnrollment /></div><dialog ref={dialog} className="en-tour" aria-busy={moving} aria-labelledby="en-tour-title" aria-describedby="en-tour-description" onCancel={event => { event.preventDefault(); exitTour(); }}>
    {position && <svg className="en-tour-shade" width="100%" height="100%" aria-hidden="true">
      <defs><mask id="en-tour-mask"><rect width="100%" height="100%" fill="white" /><rect x={position.x} y={position.y} width={position.width} height={position.height} rx="12" fill="black" /></mask></defs>
      <rect width="100%" height="100%" fill="#092b3bed" mask="url(#en-tour-mask)" />
      <rect className="en-tour-spotlight" x={position.x} y={position.y} width={position.width} height={position.height} rx="12" fill="none" stroke="#c8ded5" strokeWidth="2" />
    </svg>}
    <section ref={card} className="en-tour-card" style={{ left: position?.cardX ?? 16, top: position?.cardY ?? 16, visibility: position ? 'visible' : 'hidden' }}>
      <header><span className="en-tour-kicker"><Compass size={16} aria-hidden="true" /> YOUR ENROLLMENT GUIDE</span><button className="en-tour-close" type="button" aria-label="Close walkthrough" onClick={exitTour}><X size={18} /></button></header>
      <div key={step} className="en-tour-copy"><p className="en-tour-count">Step {step + 1} of {steps.length}</p>
      <h2 ref={heading} tabIndex={-1} id="en-tour-title">{current.title}</h2>
      <p id="en-tour-description">{current.text}</p></div>
      <div className="en-tour-progress" aria-hidden="true">{steps.map((item, index) => <span key={item.target} data-complete={index <= step} />)}</div>
      <footer><button type="button" className="en-tour-skip" onClick={exitTour}>Skip tour</button><div>{step > 0 && <button type="button" className="en-tour-back" disabled={moving} onClick={() => setStep(value => value - 1)}><ArrowLeft size={16} aria-hidden="true" /> Back</button>}<button className="en-tour-next" type="button" disabled={moving} onClick={() => step === steps.length - 1 ? exitTour() : setStep(value => value + 1)}>{step === steps.length - 1 ? 'Finish tour' : 'Next'}{step === steps.length - 1 ? <Check size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}</button></div></footer>
    </section>
  </dialog></>;
}
