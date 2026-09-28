import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Bell, CalendarDays, ChevronLeft, ChevronRight, Clock3, Coins, FileText, House, Megaphone, Newspaper, Pencil, Wallet, X } from 'lucide-react';
import { loadEnrollmentTasks } from '../lib/enrollment-preview';
import { StudentNavigation } from '../components/StudentNavigation';
import '../home-dashboard.css';

const base = import.meta.env.BASE_URL;
const enrollmentUrl = `${base}my-enrollment`;
const campusDestinations = [
  { id: 'library', name: 'Library', hint: 'Classrooms & study spaces', description: 'Explore classrooms, quiet study rooms and shared learning spaces at the University Library.' },
  { id: 'sports', name: 'Sports Center', hint: 'Sports & campus events', description: 'Discover campus sports, recreation and upcoming activities at the Sports Center.' },
  { id: 'fraternity', name: 'Fraternity House', hint: 'Social & community events', description: 'Meet your campus community through student socials and fraternity events.' },
  { id: 'union', name: 'Student Union', hint: 'Clubs & student life', description: 'Find student clubs, community activities and places to connect at the Student Union.' },
];
const news = [
  { title: 'Your first week, made easy', date: '10 Jul', image: 'campus-northbridge.png', description: 'A guide to settling into campus life.', body: 'Start with a walk around the Main Quad, find your favorite study spot, and meet the people who will share your next chapter. The welcome team is here to help you find your way.' },
  { title: 'Find your people on campus', date: '9 Jul', image: 'interest-clubs.png', description: 'Big interests. New connections.', body: 'Explore student clubs and societies at the Student Union. From creative communities to sports and volunteering, there is room to try something new.' },
  { title: 'Make room for a little inspiration', date: '8 Jul', image: 'interest-arts.png', description: 'Discover the creative side of Northbridge.', body: 'Visit campus exhibitions, meet student makers, and discover the spaces where new ideas take shape.' },
];
const announcements = [
  { title: 'Welcome week schedule is live', category: 'Campus life', date: '19 Jul', fresh: true, body: 'Your first week starts here. Join the campus welcome tour at 10:00 AM on 20 July at the Main Quad, then meet your student community at 2:00 PM on 24 July in the Student Union.' },
  { title: 'Residence move-in booking is open', category: 'Housing', date: '18 Jul', fresh: false, body: 'Complete your housing preference in My Enrollment. Your residence team will share move-in booking instructions once your housing assignment is confirmed.' },
];
const events = [
  { date: '2027-07-20', short: 'Campus tour · 10 AM', title: 'Campus welcome tour', time: '10:00 AM UTC', place: 'Main Quad', category: 'Campus life', tone: 'green', description: 'Meet your welcome team at the Main Quad for a guided walk through your new campus. Discover the library, teaching spaces, and student essentials.' },
  { date: '2027-07-24', short: 'Library tour · 9 AM', title: 'Discover your library', time: '9:00 AM UTC', place: 'University Library', category: 'Campus life', tone: 'green', description: 'Find study spaces, explore the collections, and meet the library team.' },
  { date: '2027-07-24', short: 'Study group · 11 AM', title: 'First-year study group', time: '11:00 AM UTC', place: 'Learning Commons', category: 'Academic life', tone: 'purple', description: 'Meet fellow first-year students and share ideas for planning your first semester.' },
  { date: '2027-07-24', short: 'Meet students · 2 PM', title: 'Meet your student community', time: '2:00 PM UTC', place: 'Student Union', category: 'Campus life', tone: 'purple', description: 'An informal afternoon to meet other new students, explore clubs, and make your first campus connections.' },
  { date: '2027-07-24', short: 'Aid clinic · 3 PM', title: 'Financial aid drop-in', time: '3:00 PM UTC', place: 'Student Services', category: 'Financials', tone: 'amber', description: 'Bring your questions about financial aid, payment plans, and preparing your student budget.' },
  { date: '2027-07-24', short: 'Film night · 6 PM', title: 'Outdoor film night', time: '6:00 PM UTC', place: 'Main Quad', category: 'Campus life', tone: 'green', description: 'Wind down with an outdoor film and meet other new students on the lawn.' },
];
const dayMs = 86400000;
const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const shift = (date: Date, days: number) => new Date(date.getTime() + days * dayMs);

function CardAction({ children, href, onClick }: { children: ReactNode } & ({ href: string; onClick?: never } | { href?: never; onClick: () => void })) {
  const content = <><span>{children}</span><ArrowRight size={16} aria-hidden="true" /></>;
  return href
    ? <a className="hd-card-action" href={href}>{content}</a>
    : <button className="hd-card-action" type="button" onClick={onClick}>{content}</button>;
}

function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); trigger?.focus(); };
  }, []);
  return <dialog className="hd-dialog" ref={ref} aria-labelledby="hd-dialog-title" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}><div className="hd-dialog-top"><h2 id="hd-dialog-title">{title}</h2><button className="hd-icon" aria-label="Close dialog" onClick={close}><X size={20} /></button></div>{children}<p className="hd-demo-note">Northbridge design preview · Sample information</p></dialog>;
}

function DayEventsPopover({ day, anchor, close, openEvent }: { day: Date; anchor: HTMLButtonElement; close: () => void; openEvent: (event: typeof events[number]) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const popover = ref.current!;
    const position = () => {
      const rect = anchor.getBoundingClientRect();
      const width = popover.offsetWidth, height = popover.offsetHeight;
      popover.style.left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)) + 'px';
      const top = rect.bottom + 8 + height <= window.innerHeight - 12 ? rect.bottom + 8 : rect.top - height - 8;
      popover.style.top = Math.max(12, Math.min(top, window.innerHeight - height - 12)) + 'px';
    };
    popover.showPopover();
    position();
    popover.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
      popover.hidePopover();
      anchor.focus({ preventScroll: true });
    };
  }, [anchor]);
  const items = events.filter(event => event.date === dateKey(day));
  return createPortal(<div ref={ref} id="hd-day-events" className="hd-day-popover" popover="auto" role="dialog" aria-labelledby="hd-day-events-title" onToggle={e => { if (!e.currentTarget.matches(':popover-open')) close(); }}>
    <div className="hd-popover-heading"><div><h3 id="hd-day-events-title">{day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}</h3><span>{items.length} events · UTC</span></div><button type="button" className="hd-icon" aria-label="Close day events" onClick={close}><X size={18} /></button></div>
    <div className="hd-popover-events">{items.map(event => <button key={event.title} type="button" className="hd-popover-event" onClick={() => { close(); openEvent(event); }}><span className={`hd-dot ${event.tone}`} /><time>{event.time.replace(' UTC', '')}</time><span><strong>{event.title}</strong><small>{event.place}</small></span><ChevronRight size={15} aria-hidden="true" /></button>)}</div>
  </div>, document.body);
}

export function HomeDashboard() {
  const [tasks] = useState(loadEnrollmentTasks);
  const [selected, setSelected] = useState(new Date('2027-07-24T12:00:00Z'));
  const [newsIndex, setNewsIndex] = useState(0);
  const [panel, setPanel] = useState<{ title: string; content: ReactNode } | null>(null);
  const completed = tasks.filter(task => task.status === 'done').length;
  const points = tasks.filter(task => task.status === 'done').reduce((sum, task) => sum + task.points, 0);
  const progress = Math.round(completed / tasks.length * 100);
  const monday = shift(selected, -((selected.getUTCDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => shift(monday, index));
  const [dayPopover, setDayPopover] = useState<{ day: Date; anchor: HTMLButtonElement } | null>(null);
  const article = news[newsIndex];
  const monthYear = (date: Date) => date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const range = monday.getUTCMonth() === days[6].getUTCMonth() && monday.getUTCFullYear() === days[6].getUTCFullYear()
    ? `${monday.getUTCDate()} – ${days[6].getUTCDate()} ${monthYear(days[6])}`
    : `${monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })} – ${days[6].getUTCDate()} ${monthYear(days[6])}`;
  useEffect(() => { document.title = 'Home · Northbridge University'; }, []);
  const openEvent = (event: typeof events[number]) => setPanel({ title: event.title, content: <><span className={`hd-category ${event.tone}`}>{event.category}</span><p>{new Date(`${event.date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })} · {event.time}</p><p><strong>{event.place}</strong></p><p>{event.description}</p></> });
  const sectionPanel = (label: string) => {
    setPanel({ title: label, content: label === 'Navigation' ? <p>Use the menu on the left to explore enrollment, documents and help. Your enrollment stays saved in this tab.</p> : label === 'Documents' ? <><p>Manage your documents through your enrollment tasks.</p><a className="hd-link" href={`${enrollmentUrl}?task=transcript`}>Open final transcript <ArrowRight size={16} /></a></> : <p>{label === 'Messages' ? 'Messages from Admissions will appear here when this preview is connected to your student account.' : label === 'Appointments' ? 'Appointments are not connected in this design preview. Explore the weekly calendar for sample campus events.' : label === 'Help' ? 'Start with Your Enrollment Progress to complete your enrollment tasks. Select a day in This week to explore events, or use the news arrows to discover campus life.' : label === 'Account' ? 'You are viewing the sample dashboard for Jordan Lee at Northbridge University.' : 'Discover your campus through the Library, Sports Center, Fraternity House and Student Union markers on the map.'}</p> });
  };
  return <div className="hd-shell">
    <a className="skip-link" href="#hd-main">Skip to dashboard</a>
    <StudentNavigation current="Home" points={points} onPanel={sectionPanel} />
    <main id="hd-main" className="hd-main" tabIndex={-1}>
      <section className="hd-hero" aria-label="Welcome to Northbridge"><div className="hd-greeting"><h1>Welcome back, Jordan</h1><p>Your next chapter is taking shape.</p></div><button className="hd-notifications" aria-label="Notifications, 5 updates" onClick={() => setPanel({ title: 'Notifications', content: <><p>5 sample updates for your next chapter.</p><ul><li>Welcome week schedule is live.</li><li>Housing preferences are ready to complete.</li><li>Your Photo ID is in review.</li><li>Your orientation registration is complete.</li><li>Your health records are on file.</li></ul></> })}><Bell size={27} /><span>5</span></button>
        <div className="hd-campus-art" aria-hidden="true" />
        <nav className="hd-map-markers" aria-label="Explore campus">{campusDestinations.map(place => <button type="button" key={place.id} className={`hd-map-pin campus-${place.id}`} aria-label={place.name} aria-haspopup="dialog" onClick={() => setPanel({ title: place.name, content: <><span className="hd-category">{place.hint}</span><p>{place.description}</p><p>Campus & study destination links will be available in a later preview.</p></> })}><span className="hd-pin-dot" aria-hidden="true" /><span>{place.name}</span><span className="hd-map-hint">{place.hint}<ArrowRight size={13} aria-hidden="true" /></span></button>)}</nav>
      </section>
      <section className="hd-card hd-week" aria-labelledby="hd-week-title"><div className="hd-card-header"><div className="hd-week-heading"><h2 id="hd-week-title"><CalendarDays />This week</h2><span className="hd-date-range">{range}</span></div><div className="hd-week-controls" role="group" aria-label="Week navigation"><button className="hd-icon" aria-label="Previous week" onClick={() => setSelected(shift(selected, -7))}><ChevronLeft size={18} /></button><button className="hd-today" onClick={() => { const now = new Date(); setSelected(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12))); }}>Today</button><button className="hd-icon" aria-label="Next week" onClick={() => setSelected(shift(selected, 7))}><ChevronRight size={18} /></button></div><CardAction onClick={() => setPanel({ title: 'Your calendar', content: <><p>All scheduled campus events</p><div className="hd-calendar-agenda">{events.map(event => <button type="button" className="hd-calendar-agenda-item" key={event.date + event.title} onClick={() => openEvent(event)}><span className={`hd-dot ${event.tone}`} /><span><time dateTime={event.date}>{new Date(`${event.date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time><strong>{event.title}</strong><small>{event.time} · {event.place}</small></span><ArrowRight size={16} aria-hidden="true" /></button>)}</div></> })}>View calendar</CardAction></div>
        <div className="hd-week-scroll"><div className="hd-days" role="group" aria-label="Choose a day">{days.map(day => {
          const dayEvents = events.filter(event => event.date === dateKey(day));
          const label = day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
          return <div key={dateKey(day)} className={`hd-day ${dateKey(day) === dateKey(selected) ? 'is-selected' : ''}`}>
            <div className="hd-day-top"><button type="button" className="hd-day-label" aria-pressed={dateKey(day) === dateKey(selected)} aria-label={label} onClick={() => { setSelected(day); setDayPopover(null); }}>{day.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })}<b>{day.getUTCDate()}</b></button>{dayEvents.length > 2 && <span className="hd-event-count" aria-label={dayEvents.length + ' events'}>{dayEvents.length}</span>}</div>
            {dayEvents.slice(0, 2).map(event => <button type="button" className={`hd-event-preview ${event.tone}`} key={event.title} aria-label={event.title + ', ' + event.time} onClick={() => { setSelected(day); openEvent(event); }}><time>{event.time.replace(':00', '').replace(' UTC', '')}</time><span>{event.short.split(' · ')[0]}</span></button>)}
            {dayEvents.length > 2 && <button type="button" className="hd-more-events" aria-label={`Show all ${dayEvents.length} events for ${label}`} aria-haspopup="dialog" aria-expanded={dayPopover?.day.getTime() === day.getTime()} aria-controls={dayPopover ? 'hd-day-events' : undefined} onClick={e => { setSelected(day); setDayPopover({ day, anchor: e.currentTarget }); }}>+{dayEvents.length - 2} more</button>}
          </div>;
        })}</div></div>

      </section>
      <div className="hd-grid"><div className="hd-left">
        <section className="hd-card hd-place" aria-labelledby="hd-place-title"><div className="hd-card-header"><h2 id="hd-place-title"><House />Your Enrollment Progress</h2><CardAction href={enrollmentUrl}>View enrollment</CardAction></div><div className="hd-progress"><strong>{progress}%</strong><progress value={completed} max={tasks.length} aria-label="Enrollment progress" /><span>{completed} of {tasks.length} tasks complete</span></div><div className="hd-tasks">{tasks.filter(task => task.status === 'todo' && !task.prerequisite).slice(0, 3).map(task => { const Icon = task.kind === 'housing' ? House : task.kind === 'sign' ? Pencil : FileText; return <a className="hd-task" key={task.id} href={`${enrollmentUrl}?task=${task.id}`}><Icon size={22} /><strong>{task.title}</strong><span><Clock3 size={16} />{task.minutes} mins</span><span><Coins size={17} />+{task.points} pts</span><ArrowRight size={17} /></a>; })}{!tasks.some(task => task.status === 'todo' && !task.prerequisite) && <p className="hd-empty">Your next steps are in review. You’re making progress!</p>}</div></section>
        <section className="hd-card hd-financials" aria-labelledby="hd-financials-title"><div className="hd-card-header"><h2 id="hd-financials-title"><Wallet />Your financials</h2><CardAction onClick={() => setPanel({ title: 'Your financials', content: <><p>This is an illustrative estimate for the academic year.</p><dl className="hd-finance-detail"><dt>Estimated total</dt><dd>$60,000</dd><dt>Aid accepted</dt><dd>−$12,000</dd><dt>Payments recorded</dt><dd>−$5,000</dd><dt>Remaining balance</dt><dd>$43,000</dd></dl><p>Official charges, payment dates, and financial aid decisions will appear when your student account is connected.</p></> })}>View financials</CardAction></div><div className="hd-financial-body"><div className="hd-donut" role="img" aria-label="Estimated total 60,000 dollars: aid accepted 12,000, payments recorded 5,000, remaining balance 43,000"><div><strong>$43,000</strong><span>Estimated balance</span></div></div><div className="hd-financial-summary"><dl><div><dt><i className="aid" />Aid accepted</dt><dd>$12,000</dd></div><div><dt><i className="payments" />Payments recorded</dt><dd>$5,000</dd></div><div><dt><i className="balance" />Remaining balance</dt><dd>$43,000</dd></div></dl><p><span>Estimated total</span><strong>$60,000</strong></p><small>A clearer picture of your next chapter.</small></div></div></section>
      </div><div className="hd-right">
        <section className="hd-card hd-announcements" aria-labelledby="hd-announcements-title"><div className="hd-card-header"><h2 id="hd-announcements-title"><Megaphone />Announcements</h2><CardAction onClick={() => setPanel({ title: 'Announcements', content: announcements.map(item => <article className="hd-dialog-article" key={item.title}><span>{item.category} · {item.date}</span><h3>{item.title}</h3><p>{item.body}</p></article>) })}>View All</CardAction></div>{announcements.map(item => <button className="hd-announcement" key={item.title} onClick={() => setPanel({ title: item.title, content: <><span className="hd-category">{item.category} · {item.date}</span><p>{item.body}</p>{item.category === 'Housing' && <a className="hd-link" href={`${enrollmentUrl}?task=housing`}>Choose housing <ArrowRight size={16} /></a>}</> })}><div><p>{item.category} · {item.date}{item.fresh && <span className="hd-new">New</span>}</p><h3>{item.title}</h3></div><ArrowRight size={18} /></button>)}</section>
        <section className="hd-card hd-news" aria-labelledby="hd-news-title"><div className="hd-card-header"><h2 id="hd-news-title"><Newspaper />News</h2><div className="hd-news-controls"><button className="hd-icon" aria-label="Previous news" onClick={() => setNewsIndex((newsIndex + news.length - 1) % news.length)}><ChevronLeft size={18} /></button><button className="hd-icon" aria-label="Next news" onClick={() => setNewsIndex((newsIndex + 1) % news.length)}><ChevronRight size={18} /></button></div></div><div aria-live="polite"><img className="hd-news-image" src={`${base}${article.image}`} alt={newsIndex === 0 ? 'Students walking past the Northbridge college buildings' : 'Student life at Northbridge'} /><h3>{article.title}</h3><span className="hd-news-date">{article.date}</span><div className="hd-news-bottom"><p>{article.description}</p><button className="hd-link" aria-label={`Read ${article.title}`} onClick={() => setPanel({ title: article.title, content: <><p>{article.date} · Campus life</p><p>{article.body}</p></> })}><ArrowRight size={19} /></button></div></div></section>
      </div></div>
    </main>{dayPopover && <DayEventsPopover {...dayPopover} close={() => setDayPopover(null)} openEvent={openEvent} />}{panel && <Modal title={panel.title} close={() => setPanel(null)}>{panel.content}</Modal>}
  </div>;
}
