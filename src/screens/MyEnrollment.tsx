import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlarmClock, ArrowDownUp, ArrowRight, CalendarDays, Check, CircleAlert, ChevronDown, ChevronLeft, ChevronRight, Clock3, Coins, CreditCard, FileUp, House, MessageCircle, PenLine, Rocket, ShieldPlus, Sparkles, UserRound, X } from 'lucide-react';
import { enrollmentStorageKey, loadEnrollmentTasks, needsAction, mountainPosition, mountainStops, orderTasks, type EnrollmentTask, type SortMode, type TaskStatus } from '../lib/enrollment-preview';
import '../my-enrollment.css';
import { StudentNavigation } from '../components/StudentNavigation';

const asset = (name: string) => `${import.meta.env.BASE_URL}enrollment/${name}`;
const typeIcons = { upload: FileUp, sign: PenLine, housing: House, payment: CreditCard, profile: UserRound, health: ShieldPlus, event: CalendarDays };
const statusLabels: Record<TaskStatus, string> = { todo: 'ToDo', review: 'In Review', done: 'Done' };
const taskStatusLabels: Record<TaskStatus, string> = { todo: 'Action needed', review: 'In review', done: 'Done' };
function StatusLabel({ status }: { status: TaskStatus }) { return <span className={`en-status-label en-status-label--${status}`}><span className="en-status-icon" aria-hidden="true">{status === 'todo' ? <CircleAlert size={14} /> : status === 'done' ? <Check size={14} /> : <span className="en-review-dot" />}</span>{taskStatusLabels[status]}</span>; }
const itemCount = (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`;

const sortChoices = [
  { value: 'smart', label: 'Smart', Icon: Sparkles },
  { value: 'due', label: 'Due Soon', Icon: AlarmClock },
  { value: 'fastest', label: 'Fastest', Icon: Rocket },
] as const;
function SortPicker({ value, onChange }: { value: SortMode; onChange: (value: SortMode) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = sortChoices.find(choice => choice.value === value)!;
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return <div className="en-sort-picker" data-smart={value === 'smart'} ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <button type="button" className="en-sort-trigger" ref={trigger} aria-label={`Sort tasks: ${selected.label}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}><span className="en-sort-caption">Sort:</span><selected.Icon size={16} className="en-sort-choice-icon" aria-hidden="true" /><span>{selected.label}</span><ArrowDownUp size={14} aria-hidden="true" /></button>
    {open && <div className="en-sort-menu" role="menu" aria-label="Sort tasks" onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
        const index = options.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next]?.focus();
      }
    }}>{sortChoices.map(({ value: option, label, Icon }) => <button type="button" role="menuitemradio" aria-checked={value === option} key={option} onClick={() => { onChange(option); setOpen(false); trigger.current?.focus(); }}><Icon size={16} aria-hidden="true" /><span>{label}</span>{value === option && <Check size={14} aria-hidden="true" />}</button>)}</div>}
  </div>;
}

function Dialog({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const trigger = useRef(document.activeElement as HTMLElement);
  useEffect(() => { ref.current?.showModal(); return () => { queueMicrotask(() => { if (trigger.current?.isConnected) trigger.current.focus(); else document.getElementById('en-content')?.focus(); }); }; }, []);
  return <dialog className="en-dialog" ref={ref} aria-labelledby="en-dialog-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <header><h2 id="en-dialog-title">{title}</h2><button type="button" className="en-icon-button" aria-label="Close dialog" onClick={close}><X size={20} /></button></header>{children}
  </dialog>;
}

function Mountain({ completed }: { completed: number }) {
  const [position, setPosition] = useState<readonly [number, number]>(mountainPosition(completed));
  const previous = useRef(completed);
  const [walking, setWalking] = useState(false);
  const [left, setLeft] = useState(false);
  useEffect(() => {
    const start = previous.current;
    previous.current = completed;
    if (start === completed || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setPosition(mountainPosition(completed)); return; }
    let frame = 0;
    const from = mountainPosition(start);
    const to = mountainPosition(completed);
    const started = performance.now();
    setWalking(true); setLeft(to[0] < from[0]);
    const move = (now: number) => {
      const progress = Math.min((now - started) / 1400, 1);
      const eased = progress * progress * (3 - 2 * progress);
      setPosition([from[0] + (to[0] - from[0]) * eased, from[1] + (to[1] - from[1]) * eased]);
      if (progress < 1) frame = requestAnimationFrame(move); else setWalking(false);
    };
    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [completed]);
  const route = mountainStops.map(stop => stop.join(',')).join(' ');
  return <section className="en-hero" aria-labelledby="en-title">
    <img className="en-mountain" src={asset('mountain.png')} alt="" />
    <div className="en-hero-copy"><span className="en-eyebrow">YOUR NEXT CHAPTER</span><h1 id="en-title">My Enrollment</h1><p className="en-hero-explanation">Upload your documents, set access preferences, and choose housing to get ready for campus. Follow each task’s status, check deadlines in the calendar, and earn points as you complete your steps.</p><div className="en-progress"><span aria-live="polite"><strong>{completed} of 8</strong> complete</span><div role="progressbar" aria-label="Enrollment progress" aria-valuemin={0} aria-valuemax={8} aria-valuenow={completed}><i style={{ width: `${completed / 8 * 100}%` }} /></div></div></div>
    <svg className="en-route" viewBox="0 0 1000 320" aria-label={`Mountain journey, ${completed} of 8 steps complete`} role="img">
      <polyline points={route} fill="none" stroke="#f8fff9" strokeWidth="3" strokeDasharray="5 7" strokeLinecap="round" />
      <polyline points={mountainStops.slice(0, Math.max(1, completed)).map(stop => stop.join(',')).join(' ')} fill="none" stroke="#b7d9b2" strokeWidth="3" strokeLinecap="round" />
      <path d="M675 52V23M675 23L697 29L675 36" fill="#efd49a" stroke="#123f41" strokeWidth="2" />
      {mountainStops.map(([x, y], i) => <g key={i} className={i < completed ? 'en-stop en-stop--done' : 'en-stop'}><circle cx={x} cy={y} r="12" /><text x={x} y={y + 4}>{i + 1}</text></g>)}
      <g transform={`translate(${position[0]} ${position[1] - 12})`}><g className={walking ? 'en-hiker is-walking' : 'en-hiker'} style={{ transform: `scaleX(${left ? -1 : 1})` }}><image href={asset('hiker.png')} x="-21" y="-49" width="42" height="56" /></g></g>
    </svg>
    <span className="en-hero-note">One step closer.</span>
  </section>;
}

function Calendar({ tasks, onOpenTask }: { tasks: EnrollmentTask[]; onOpenTask: (task: EnrollmentTask) => void }) {
  const [month, setMonth] = useState(6);
  const [year, setYear] = useState(2027);
  const [selected, setSelected] = useState(15);
  const name = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}`;
  const events = tasks.filter(task => task.due === dateKey);
  function changeMonth(amount: number) { const date = new Date(year, month + amount, 1); setYear(date.getFullYear()); setMonth(date.getMonth()); setSelected(1); }
  return <section className="en-calendar" aria-label="Enrollment calendar"><h2>Enrollment calendar</h2><div className="en-calendar-heading"><strong aria-live="polite">{name}</strong><div><button type="button" className="en-icon-button" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={17} /></button><button type="button" className="en-icon-button" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight size={17} /></button></div></div><div className="en-calendar-grid"><div className="en-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}</div><div className="en-days">{Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} />)}{Array.from({ length: count }, (_, i) => {
    const day = i + 1; const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const due = tasks.filter(task => task.due === key);
    return <button type="button" key={day} aria-pressed={selected === day} aria-label={`${name} ${day}${due.length ? `, ${due.map(task => task.title).join(', ')}` : ''}`} className={`${selected === day ? 'is-selected' : ''} ${due.length ? 'has-event' : ''}`} onClick={() => setSelected(day)}>{day}</button>;
  })}</div></div><div className="en-calendar-events" aria-live="polite">{events.length ? events.map(task => <button type="button" className="en-calendar-event" key={task.id} onClick={() => onOpenTask(task)}><strong>{selected} {new Date(year, month).toLocaleDateString('en-US', { month: 'short' })}</strong><span>{task.title}</span><ArrowRight size={16} aria-hidden="true" /></button>) : <p>No enrollment deadlines.</p>}</div></section>;
}

function TaskDialog({ task, close, update }: { task: EnrollmentTask; close: () => void; update: (id: string, status: TaskStatus) => void }) {
  const [housing, setHousing] = useState('');
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const readOnly = task.status !== 'todo' || Boolean(task.prerequisite);
  return <Dialog title={task.title} close={close}><p>{task.prerequisite ? 'Your final transcript needs to be approved before you can pay your enrollment deposit. Admissions will review your submission.' : task.description}</p>
    {readOnly ? <><div className="en-dialog-note">{task.prerequisite ? 'Next step: upload your final transcript.' : task.status === 'review' ? 'Admissions has your submission. You don’t need to do anything else right now.' : 'This step is complete. You’ve earned +100 pts.'}</div><button className="en-action" type="button" onClick={close}>Back to enrollment <ArrowRight size={17} /></button></> : <form onSubmit={event => { event.preventDefault(); if (task.kind === 'upload' && !file) { setError('Choose a PDF, JPG or PNG file to continue.'); event.currentTarget.querySelector('input')?.focus(); return; } if (task.kind === 'housing' && !housing) { setError('Choose your housing preference.'); event.currentTarget.querySelector('input')?.focus(); return; } if (task.kind === 'sign' && !consent) { setError('Confirm your access preference to continue.'); event.currentTarget.querySelector('input')?.focus(); return; } update(task.id, task.kind === 'upload' ? 'review' : 'done'); close(); }}>
      {task.kind === 'housing' && <fieldset aria-invalid={Boolean(error)} aria-describedby={error ? "en-task-error" : undefined}><legend>Where would you like to live?</legend>{['On campus', 'Off campus', 'I’m still deciding'].map(value => <label className="en-choice" key={value}><input type="radio" name="housing" value={value} checked={housing === value} onChange={() => { setHousing(value); setError(''); }} />{value}</label>)}</fieldset>}
      {task.kind === 'sign' && <label className="en-choice"><input type="checkbox" aria-invalid={Boolean(error)} aria-describedby={error ? "en-task-error" : undefined} checked={consent} onChange={event => { setConsent(event.target.checked); setError(''); }} />Keep my educational records private. I can manage delegate access later.</label>}
      {task.kind === 'upload' && <label className="en-upload">Choose transcript <span>PDF, JPG or PNG · up to 10 MB</span><input type="file" aria-invalid={Boolean(error)} aria-describedby={error ? "en-task-error" : undefined} accept=".pdf,.jpg,.jpeg,.png" onChange={event => { const chosen = event.target.files?.[0]; if (chosen && (chosen.size > 10 * 1024 * 1024 || !/\.(pdf|jpe?g|png)$/i.test(chosen.name))) { setFile(null); setError('Choose a PDF, JPG or PNG smaller than 10 MB.'); event.target.value = ''; } else { setFile(chosen || null); setError(''); } }} /></label>}
      {error && <p id="en-task-error" className="en-error" role="alert">{error}</p>}<p className="en-preview-note">Interactive preview. No files or preferences are sent to a university.</p><button className="en-action" type="submit">{task.kind === 'upload' ? 'Submit for review' : 'Save preference'} <ArrowRight size={17} /></button>
    </form>}
  </Dialog>;
}

export function MyEnrollment() {
  const [tasks, setTasks] = useState(loadEnrollmentTasks);

  const [collapsed, setCollapsed] = useState<Record<TaskStatus, boolean>>({ todo: false, review: false, done: false });
  const [sort, setSort] = useState<SortMode>('smart');
  const [quickFilter, setQuickFilter] = useState<TaskStatus | 'all'>('all');



  const [task, setTask] = useState<EnrollmentTask | null>(() => tasks.find(item => item.id === new URLSearchParams(window.location.search).get('task')) ?? null);
  const [panel, setPanel] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const completed = tasks.filter(item => item.status === 'done').length;
  useEffect(() => { document.title = 'My Enrollment · Northbridge University'; }, []);
  useEffect(() => { try { sessionStorage.setItem(enrollmentStorageKey, JSON.stringify(tasks.map(({ id, status }) => ({ id, status })))); } catch { /* Optional preview storage. */ } }, [tasks]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 5000); return () => window.clearTimeout(timer); }, [notice]);
  function update(id: string, status: TaskStatus) { setTasks(current => current.map(item => item.id === id && item.status === 'todo' ? { ...item, status, description: status === 'review' ? 'Your submission is with Admissions.' : item.description, action: status === 'review' ? 'View submission' : 'View details' } : item)); setNotice(status === 'done' ? '+100 pts. One step closer to campus.' : 'Submitted for review. Admissions will take it from here.'); }
  const visible = orderTasks(tasks.filter(item => quickFilter === 'all' || (quickFilter === 'todo' ? needsAction(item) : item.status === quickFilter)), sort);
  return <div className="en-shell"><a className="skip-link" href="#en-content">Skip to enrollment tasks</a>
    <StudentNavigation current="My Enrollment" points={completed * 100} onPanel={setPanel} />
    <main className="en-main"><Mountain completed={completed} /><div className="en-body"><div className="en-columns"><div id="en-content" className="en-tasks" tabIndex={-1}>
      <div className="en-task-controls"><div className="en-quick-filters" role="group" aria-label="Filter by status"><button type="button" aria-pressed={quickFilter === 'all'} onClick={() => setQuickFilter('all')}>All tasks</button>{(['todo', 'review', 'done'] as const).map(status => <button type="button" key={status} aria-pressed={quickFilter === status} onClick={() => { setQuickFilter(current => current === status ? 'all' : status); setCollapsed(current => ({ ...current, [status]: false })); }}><StatusLabel status={status} /></button>)}</div><SortPicker value={sort} onChange={setSort} /></div>
      {visible.length === 0 && <p className="en-filter-empty" role="status">No tasks with this label. Select All tasks to see your enrollment steps.</p>}
      {(['todo', 'review', 'done'] as const).map(status => { const group = visible.filter(item => item.status === status); if (quickFilter !== 'all' && !group.length) return null; return <section key={status} className={`en-group en-group--${status}`} aria-label={`${statusLabels[status]} tasks`}><div className="en-group-heading"><h2><button type="button" aria-expanded={!collapsed[status]} aria-controls={`en-group-${status}`} onClick={() => setCollapsed(current => ({ ...current, [status]: !current[status] }))}><span className="en-group-marker" aria-hidden="true" />{statusLabels[status]}<span className="en-group-count">{itemCount(group.length)}</span><ChevronDown size={18} className={collapsed[status] ? 'is-collapsed' : ''} aria-hidden="true" /></button></h2></div><div id={`en-group-${status}`} hidden={collapsed[status]}>{group.map(item => { const Icon = typeIcons[item.kind]; return <article className={`en-task ${needsAction(item) ? 'en-task--attention' : 'en-task--standard'}`} key={item.id} aria-label={item.title}><div className="en-task-info"><Icon className="en-task-icon" size={20} strokeWidth={1.5} aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.description}</p></div></div>{needsAction(item) && <div className="en-task-status"><StatusLabel status="todo" /></div>}<div className="en-task-meta"><span><Clock3 size={14} aria-hidden="true" />{item.minutes} mins</span><span><Coins size={15} aria-hidden="true" />+{item.points} pts</span></div><button className={`en-action ${item.status !== 'todo' || item.prerequisite ? 'en-action--secondary' : ''}`} type="button" onClick={() => setTask(item)}>{item.action}<ArrowRight size={15} /></button></article>; })}</div></section>; })}
      <p className="en-time-note">Time estimates cover your part, not university review.</p></div><aside className="en-rail"><Calendar tasks={tasks} onOpenTask={setTask} /><div className="en-support"><section className="en-help"><MessageCircle size={25} /><div><h2>Need help?</h2><p>We’re here for your next step.</p><button type="button" onClick={() => setPanel('Help')}>View help center <ArrowRight size={15} /></button></div></section><img className="en-corner-leaves" src={asset('pointed-corner-leaves.png')} alt="" aria-hidden="true" /></div></aside></div></div></main>
    <div className="en-toast" role="status" aria-live="polite" data-visible={Boolean(notice)}>{notice}</div>
    {task && <TaskDialog task={task} close={() => setTask(null)} update={update} />}
    {panel && <Dialog title={panel} close={() => setPanel(null)}>{panel === 'Help' ? <><p>Your next step, made simpler.</p><details open><summary>What happens after I upload a document?</summary><p>It moves to In Review while Admissions checks it. You’ll gain points and move up the mountain when the step is complete.</p></details><details><summary>Why can’t I pay my deposit yet?</summary><p>Your final transcript must be approved first. Use View prerequisite to see what’s needed.</p></details><details><summary>How does Smart Sort work?</summary><p>The planned AI order considers deadlines and dependencies. This preview demonstrates that order using sample task rules.</p></details></> : panel === 'Documents' ? <><p>Your enrollment documents</p>{tasks.filter(item => item.kind === 'upload' || item.kind === 'health').map(item => <button key={item.id} className="en-document-link" onClick={() => { setPanel(null); setTask(item); }}>{item.title}<ArrowRight size={16} /></button>)}</> : panel === 'Navigation' ? <p>Use the menu on the left to explore enrollment, documents and help. Your enrollment stays saved in this tab.</p> : <p>{panel === 'Messages' ? 'You’re all caught up. Updates from Admissions will appear here.' : panel === 'Appointments' ? 'You have no upcoming appointments.' : panel === 'Account' ? 'This sample account belongs to Jordan Lee at Northbridge University.' : 'Campus life is your next chapter. Clubs, events and communities will live here.'}</p>}<button className="en-action en-action--secondary" type="button" onClick={() => setPanel(null)}>Back to enrollment <ArrowRight size={16} /></button></Dialog>}
  </div>;
}
