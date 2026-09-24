import { useState } from 'react';
import { CircleHelp, LogOut, Menu, X } from 'lucide-react';
import { stageIndex, stageNames, themes, type DemoState, type Screen, type ThemeId } from '../lib/demo';

interface LayoutProps {
  children: React.ReactNode;
  state: DemoState;
  screen: Screen;
  onHelp: () => void;
  onSignOut: () => void;
  onTheme: (theme: ThemeId) => void;
  onNavigate: (screen: Screen) => void;
}

export function Layout({ children, state, screen, onHelp, onSignOut, onTheme, onNavigate }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const current = stageIndex(screen);
  const offer = screen === 'offer';
  const theme = themes[state.theme];
  const navScreens: Screen[] = ['offer', 'contact', 'campus', 'enrollment', 'next-steps'];

  return <div className="site-shell" data-theme={state.theme}>
    <a className="skip-link" href="#main">Skip to main content</a>
    {!offer && <header className="site-header">
      <div className="institution-mark"><span>{theme.name}</span><span className="institution-caption">Admitted-student portal</span></div>
      <div className="header-actions">
        <label className="theme-switch"><span>Sample university</span><select aria-label="Preview university" value={state.theme} onChange={(event) => onTheme(event.target.value as ThemeId)}><option value="northbridge">Northbridge</option><option value="audentra">Audentra</option></select></label>
        <button className="plain-button help-button" type="button" onClick={onHelp}><CircleHelp size={18} aria-hidden="true" /><span>Help</span></button>
        {state.signedIn && screen !== 'sign-in' && <button className="plain-button signout-button" type="button" onClick={onSignOut}><LogOut size={17} aria-hidden="true" /><span>Sign out</span></button>}
        {current >= 0 && <button className="plain-button menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="stage-menu" aria-label={menuOpen ? 'Close journey menu' : 'Open journey menu'} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>}
      </div>
    </header>}
    {menuOpen && current >= 0 && <nav id="stage-menu" className="stage-menu" aria-label="Journey menu"><ol>{stageNames.map((name, index) => <li key={name}><button type="button" disabled={index > current || (index === 1 && !state.offerAccepted)} onClick={() => { setMenuOpen(false); onNavigate(navScreens[index]); }}>{index + 1}. {name}</button></li>)}</ol></nav>}
    {current >= 0 && !offer && <StageProgress screen={screen} />}
    <main id="main" tabIndex={-1}>{children}</main>
    {offer && <StageProgress screen={screen} />}
    <footer className="site-footer"><span>Sample student experience. No university action is completed in this preview.</span><span className="footer-brand">Powered by <img src="/audentra-logo.png" alt="Audentra" /></span></footer>
  </div>;
}

export function StageProgress({ screen }: { screen: Screen }) {
  const current = stageIndex(screen);
  return <nav className={`journey-progress ${screen === 'offer' ? 'offer-progress' : ''}`} aria-label="Onboarding progress"><ol>{stageNames.map((name, index) => <li key={name} className={index < current ? 'done' : index === current ? 'current' : 'locked'} aria-current={index === current ? 'step' : undefined}><span className="journey-dot">{index < current ? '✓' : index + 1}</span><span className="journey-label">{name}</span></li>)}</ol></nav>;
}
