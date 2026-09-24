import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { clearDemoState, initialState, loadDemoState, readScreen, saveDemoState, screenPath, type DemoState, type DocumentKind, type Screen, type ThemeId } from './lib/demo';
import { InvitationScreen, SignInScreen } from './screens/AuthScreens';
import { CampusScreen, ContactScreen } from './screens/OfferFlow';
import { OfferScreen } from './screens/OfferExperience';
import { DiscoverScreen, DocumentsScreen, EnrollmentScreen, NextStepsScreen, TasksScreen } from './screens/EnrollmentFlow';
import { MotionConcept } from './screens/MotionConcept';

const isDemoMode = __TEST_MODE__;

export default function App() {
  const [state, setState] = useState<DemoState>(loadDemoState);
  const [screen, setScreen] = useState<Screen>(readScreen);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => { saveDemoState(state); }, [state]);
  useEffect(() => { const onPop = () => setScreen(readScreen()); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);

  function navigate(next: Screen) {
    window.history.pushState({}, '', screenPath[next]);
    setScreen(next);
    window.setTimeout(() => { document.getElementById('main')?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }, 0);
  }

  function enterSample() {
    setState((current) => ({ ...current, signedIn: true }));
    if (!state.offerAccepted) navigate('offer');
    else if (!state.accountReady) navigate('contact');
    else if (!state.campusDone) navigate('campus');
    else if (!state.enrollmentStarted && !state.hasSeenNextSteps) navigate('enrollment');
    else if (state.hasSeenNextSteps) navigate('next-steps');
    else navigate('documents');
  }

  function switchTheme(theme: ThemeId) {
    if (theme === state.theme) return;
    const signedIn = state.signedIn;
    setState({ ...initialState, theme, signedIn });
    if (signedIn) navigate('offer');
  }

  function reset() { clearDemoState(); setState(initialState); setHelpOpen(false); navigate('sign-in'); }
  function signOut() { setState((current) => ({ ...current, signedIn: false })); navigate('sign-in'); }

  function setDocument(kind: DocumentKind, file: File, source: 'camera' | 'file') {
    setState((current) => ({ ...current, [kind]: { name: file.name, state: 'selected', source } }));
  }

  if (!isDemoMode) return <div className="disabled-preview"><h1>Demo mode is disabled.</h1><p>This frontend has no backend connection. Set TEST_MODE=true to explore the sample journey.</p></div>;

  const pagesRoot = import.meta.env.BASE_URL !== '/' && [import.meta.env.BASE_URL, `${import.meta.env.BASE_URL}index.html`].includes(window.location.pathname);
  if (window.location.pathname === '/motion-concept' || pagesRoot) return <MotionConcept />;

  const requiresSession = !['sign-in', 'invitation'].includes(screen);
  const requiresOffer = ['contact', 'campus', 'enrollment', 'documents', 'next-steps', 'tasks', 'discover'].includes(screen);
  const requiresAccount = ['campus', 'enrollment', 'documents', 'next-steps', 'tasks', 'discover'].includes(screen);
  const visibleScreen: Screen = requiresSession && !state.signedIn ? 'sign-in'
    : requiresOffer && !state.offerAccepted ? 'offer'
      : requiresAccount && !state.accountReady ? 'contact'
        : screen === 'documents' && !state.enrollmentStarted ? 'enrollment' : screen;

  return <Layout state={state} screen={visibleScreen} onHelp={() => setHelpOpen(true)} onSignOut={signOut} onTheme={switchTheme} onNavigate={navigate}>
    {visibleScreen === 'sign-in' && <SignInScreen themeId={state.theme} onDemoLogin={enterSample} onInvitation={() => navigate('invitation')} />}
    {visibleScreen === 'invitation' && <InvitationScreen themeId={state.theme} onContinue={enterSample} onBack={() => navigate('sign-in')} />}
    {visibleScreen === 'offer' && <OfferScreen themeId={state.theme} onTheme={switchTheme} onHelp={() => setHelpOpen(true)} onAccept={() => { setState((current) => ({ ...current, offerAccepted: true })); navigate('contact'); }} />}
    {visibleScreen === 'contact' && <ContactScreen state={state} onContinue={(email, phone) => { setState((current) => ({ ...current, accountReady: true, email, phone })); navigate('campus'); }} />}
    {visibleScreen === 'campus' && <CampusScreen state={state} onContinue={(interests) => { setState((current) => ({ ...current, interests, campusDone: true })); navigate('enrollment'); }} />}
    {visibleScreen === 'enrollment' && <EnrollmentScreen state={state} onStart={() => { setState((current) => ({ ...current, enrollmentStarted: true })); navigate('documents'); }} onLater={() => { setState((current) => ({ ...current, hasSeenNextSteps: true })); navigate('next-steps'); }} />}
    {visibleScreen === 'documents' && <DocumentsScreen state={state} onSelect={setDocument} onContinue={() => { setState((current) => ({ ...current, hasSeenNextSteps: true })); navigate('next-steps'); }} onLater={() => { setState((current) => ({ ...current, hasSeenNextSteps: true })); navigate('next-steps'); }} />}
    {visibleScreen === 'next-steps' && <NextStepsScreen state={state} onTasks={() => navigate('tasks')} onExplore={() => navigate('discover')} onStartEnrollment={() => navigate('enrollment')} />}
    {visibleScreen === 'tasks' && <TasksScreen state={state} onDocuments={() => navigate('documents')} onBack={() => navigate('next-steps')} />}
    {visibleScreen === 'discover' && <DiscoverScreen state={state} onBack={() => navigate('next-steps')} />}
    {helpOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpOpen(false); }}><section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onKeyDown={(event) => { if (event.key === 'Escape') setHelpOpen(false); }}><h2 id="help-title">About this preview</h2><p>Jordan, both universities, their offer, and the dates are sample content. Offer acceptance, account creation, and document selection stay in this browser tab. Nothing is sent to a university.</p><p>Start with the offer. Contact and access follows only after sample acceptance. Campus interests are optional, and enrollment can be resumed later.</p><div className="help-actions"><button className="button button-primary" type="button" onClick={() => setHelpOpen(false)}>Close help</button><button className="text-link" type="button" onClick={reset}>Restart sample</button></div></section></div>}
  </Layout>;
}
