import { useEffect, useRef, useState } from 'react';
import { CalendarDays, CircleHelp, Coins, FileText, GraduationCap, Home, Menu, MessageCircle, Trees, University, UserRound } from 'lucide-react';
import '../my-enrollment.css';
import '../student-navigation.css';

const items = [['Home', Home], ['My Enrollment', FileText], ['Documents', FileText], ['Messages', MessageCircle], ['Appointments', CalendarDays], ['Campus & study', GraduationCap], ['Help', CircleHelp], ['Account', UserRound]] as const;

/** The original My Enrollment navigation, shared by both student pages. */
export function StudentNavigation({ current, points, onPanel }: {
  current: 'Home' | 'My Enrollment';
  points: number;
  onPanel: (label: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector('button')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); return; }
      if (event.key !== 'Tab') return;
      const controls = sidebar.current?.querySelectorAll<HTMLButtonElement>('button');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const resize = () => { if (window.innerWidth >= 850) setMenuOpen(false); };
    document.addEventListener('keydown', key);
    window.addEventListener('resize', resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', key);
      window.removeEventListener('resize', resize);
      mobileTrigger.current?.focus();
    };
  }, [menuOpen]);

  function navigate(label: string) {
    setMenuOpen(false);
    if (label === current) return;
    if (label === 'Home' || label === 'My Enrollment') {
      window.location.assign(import.meta.env.BASE_URL + (label === 'Home' ? 'dashboard' : 'my-enrollment'));
    } else onPanel(label);
  }

  return <div className="student-navigation">
    <header className="en-mobile-header"><button ref={mobileTrigger} type="button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu size={23} /></button><span>Northbridge University</span><div className="en-mobile-points" role="region" aria-label="Mobile points earned"><Coins size={17} aria-hidden="true" /><strong>{points}</strong> pts</div></header>
    {menuOpen && <button className="en-menu-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside ref={sidebar} className={`en-sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
      <button className="en-menu-button" type="button" onClick={() => { if (window.innerWidth < 850) setMenuOpen(false); else onPanel('Navigation'); }}><Menu size={23} /><span>Menu</span></button>
      <div className="en-wordmark">Northbridge<br />University</div>
      <nav>{items.map(([label, Icon]) => <button key={label} type="button" aria-current={label === current ? 'page' : undefined} onClick={() => navigate(label)}><Icon size={20} strokeWidth={1.6} /><span>{label}</span></button>)}</nav>
      <section className="en-points en-sidebar-points" aria-label="Points earned"><span>Your progress</span><strong>{points}<small> pts earned</small></strong><p>Small steps. Big next chapter.</p></section>
      <div className="en-sidebar-footer" aria-hidden="true"><div><Trees size={52} strokeWidth={.55} /><University size={75} strokeWidth={.55} /></div><p>SAME CURIOSITY.<br />A BRIGHTER TOMORROW.</p><i /></div>
    </aside>
  </div>;
}
