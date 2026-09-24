import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Download, Eye, EyeOff, FileText, GraduationCap, X } from 'lucide-react';
import { IdCardStudio } from './IdCardStudio';
import { CollegeLifeTransition, collegeActivities } from '../components/CollegeLifeTransition';

type Chapter = 'arrival' | 'offer' | 'access' | 'documents' | 'declined' | 'enrollment' | 'opportunities';
type Provider = 'Google' | 'Apple' | 'Facebook';

const steps = [
  { chapter: 'offer', label: 'Your offer' },
  { chapter: 'access', label: 'Your access' },
  { chapter: 'documents', label: 'Create your ID' },
] as const;

const offerFacts = [
  ['Start', 'Autumn 2027'],
  ['Study', 'Full time · Main campus'],
  ['Condition', 'Final transcript required'],
  ['Respond by', '15 June 2027'],
];
const COLLEGE_SCENE_MS = 2200;
const staticAsset = (name: string) => `${import.meta.env.BASE_URL}${name}`;

function keepDialogFocus(event: KeyboardEvent<HTMLElement>, close: () => void) {
  if (event.key === 'Escape') { close(); return; }
  if (event.key !== 'Tab') return;
  const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled])'));
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}

export function MotionConcept() {
  const [chapter, setChapter] = useState<Chapter>('arrival');
  const [furthestStep, setFurthestStep] = useState(0);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineOther, setDeclineOther] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [acceptScene, setAcceptScene] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [email, setEmail] = useState('jordan.lee@example.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [accessAttempted, setAccessAttempted] = useState(false);
  const [provider, setProvider] = useState<Provider | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const declineTriggerRef = useRef<HTMLButtonElement>(null);
  const declineCloseRef = useRef<HTMLButtonElement>(null);
  const letterTriggerRef = useRef<HTMLButtonElement>(null);
  const letterCloseRef = useRef<HTMLButtonElement>(null);
  const acceptTimer = useRef<number | null>(null);
  const sceneTimer = useRef<number | null>(null);
  const providerTimer = useRef<number | null>(null);
  const currentStep = steps.findIndex((step) => step.chapter === chapter);
  const showProgress = ['offer', 'access', 'documents'].includes(chapter);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 12 && confirmPassword === password;
  const saveReady = emailValid && passwordValid;
  const canTrySave = Boolean(email.trim() && password && confirmPassword);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Northbridge University | Your next chapter';
    return () => { document.title = previousTitle; };
  }, []);
  useEffect(() => { if (chapter !== 'documents') titleRef.current?.focus({ preventScroll: true }); }, [chapter]);
  useEffect(() => { if (declineOpen) declineCloseRef.current?.focus(); }, [declineOpen]);
  useEffect(() => { if (letterOpen) letterCloseRef.current?.focus(); }, [letterOpen]);
  useEffect(() => {
    if (!letterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [letterOpen]);
  useEffect(() => () => {
    if (acceptTimer.current !== null) window.clearTimeout(acceptTimer.current);
    if (sceneTimer.current !== null) window.clearInterval(sceneTimer.current);
    if (providerTimer.current !== null) window.clearTimeout(providerTimer.current);
  }, []);

  function go(next: Chapter) {
    setLetterOpen(false);
    setChapter(next);
    const nextStep = steps.findIndex((step) => step.chapter === next);
    if (nextStep >= 0) setFurthestStep((current) => Math.max(current, nextStep));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function closeLetter() {
    setLetterOpen(false);
    window.setTimeout(() => letterTriggerRef.current?.focus(), 0);
  }
  function closeDecline() {
    setDeclineOpen(false);
    window.setTimeout(() => declineTriggerRef.current?.focus(), 0);
  }
  function acceptOffer() {
    if (accepting) return;
    setAcceptScene(0);
    setAccepting(true);
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const delay = import.meta.env.MODE === 'test' ? 300 : reducedMotion ? 900 : collegeActivities.length * COLLEGE_SCENE_MS + 300;
    if (!reducedMotion && import.meta.env.MODE !== 'test') {
      sceneTimer.current = window.setInterval(() => setAcceptScene((current) => Math.min(current + 1, collegeActivities.length - 1)), COLLEGE_SCENE_MS);
    }
    acceptTimer.current = window.setTimeout(finishAcceptance, delay);
  }
  function finishAcceptance() {
    if (sceneTimer.current !== null) window.clearInterval(sceneTimer.current);
    if (acceptTimer.current !== null) window.clearTimeout(acceptTimer.current);
    sceneTimer.current = null;
    acceptTimer.current = null;
    setAccepting(false);
    go('access');
  }
  function chooseProvider(nextProvider: Provider) {
    setProvider(nextProvider);
    const delay = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 100 : 560;
    providerTimer.current = window.setTimeout(() => { setProvider(null); go('documents'); }, delay);
  }
  function saveAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccessAttempted(true);
    if (!emailValid) { emailRef.current?.focus(); return; }
    if (password.length < 12) { passwordRef.current?.focus(); return; }
    if (confirmPassword !== password) { confirmRef.current?.focus(); return; }
    if (saveReady) go('documents');
  }

  return <main className="motion-lab journey" data-chapter={chapter}>
    <header className="journey__header">
      <div className="journey__brand"><span className="journey__brand-monogram" aria-hidden="true">N</span><strong>Northbridge <span>University</span></strong></div>
      <a className="journey__exit" href={import.meta.env.BASE_URL === '/' ? '/sign-in' : import.meta.env.BASE_URL}>Exit enrollment <ArrowRight size={17} /></a>
    </header>

    {showProgress && <nav className="journey__progress" aria-label="Enrollment steps"><ol>
      {steps.map((step, index) => <li key={step.chapter} className={index < currentStep ? 'is-done' : index === currentStep ? 'is-active' : index <= furthestStep ? 'is-visited' : ''}>
        <button className="journey__progress-step" type="button" disabled={index === currentStep || index > furthestStep} aria-current={index === currentStep ? 'step' : undefined} onClick={() => go(step.chapter)}><span className="journey__progress-number">{index < currentStep ? <Check size={15} /> : '0' + (index + 1)}</span><span>{step.label}</span></button>
      </li>)}
    </ol></nav>}

    {chapter === 'arrival' && <section className="journey__split journey__welcome" aria-labelledby="motion-title">
      <img className="journey__welcome-backdrop" src={staticAsset('campus-northbridge.png')} alt="" />
      <div className="journey__welcome-content">
        <h1 id="motion-title" tabIndex={-1} ref={titleRef}>Jordan, your next chapter starts here<span>.</span></h1>
        <p>Your place in Computer Science is waiting.</p>
        <div className="journey__welcome-handwriting" aria-hidden="true">Brighter<br />Thinking<br />Together<span /></div>
        <div className="journey__welcome-next">
          <div className="journey__welcome-highlights" aria-label="Offer at a glance"><div><GraduationCap size={22} /><span><strong>BSc Computer Science</strong><small>Full time · Main campus</small></span></div><div><span className="journey__welcome-coin" aria-hidden="true">$</span><span><strong>$24,800</strong><small>Estimated annual tuition</small></span></div></div>
          <button className="journey__button journey__button--primary" type="button" onClick={() => go('offer')}>Let’s go <ArrowRight size={20} /></button>
          <div className="journey__welcome-mini-progress" aria-label="First step: review your offer"><span className="is-current">Offer</span><span>Your access</span><span>Create your ID</span></div>
        </div>
      </div>
      <div className="journey__welcome-image" aria-label="Preview of your conditional offer letter">
        <div className="journey__welcome-envelope" aria-hidden="true"><div className="journey__welcome-envelope-back" /><div className="journey__welcome-envelope-flap" /></div>
        <div className="journey__welcome-letter"><div className="journey__welcome-letter-top"><div><span className="journey__brand-monogram" aria-hidden="true">N</span><strong>Northbridge<br />University</strong></div><span>Conditional offer</span></div><div className="journey__welcome-letter-body"><p>Dear Jordan,</p><p>We are delighted to make you a conditional offer of a place at Northbridge University to study Computer Science.</p></div><div className="journey__welcome-letter-foot"><span>Admissions Office<br /><small>Northbridge University</small></span><span className="journey__welcome-tower" aria-hidden="true">N</span></div></div>
        <div className="journey__welcome-envelope-front" aria-hidden="true" />
      </div>
    </section>}

    {chapter === 'offer' && <section className="journey__offer journey__split" aria-labelledby="motion-title">
      <div className="journey__offer-content">
        <button className="journey__back" type="button" onClick={() => go('arrival')}><ArrowLeft size={17} /> Back</button>
        <div className="journey__overline">01 / Your offer</div>
        <h1 id="motion-title" tabIndex={-1} ref={titleRef}>Your offer, Jordan<span>.</span></h1>
        <p className="journey__section-intro">This is your moment. Explore the details, read your letter, and tell us what you decide.</p>
        <div className="journey__offer-card" role="article" aria-label="Sample conditional offer details">
          <div className="journey__offer-card-top"><div><span>CONDITIONAL OFFER</span><h2>BSc Computer Science</h2></div><GraduationCap size={32} aria-hidden="true" /></div>
          <dl className="journey__offer-facts">{offerFacts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <div className="journey__offer-costs"><h3>Tuition & fees</h3><dl><div><dt>Annual tuition</dt><dd>$24,800</dd></div><div><dt>Estimated university fees</dt><dd>$1,200</dd></div><div className="journey__offer-total"><dt>Estimated annual direct charges</dt><dd>$26,000</dd></div></dl><p>Scholarships and aid are not confirmed. Your letter has the full terms.</p></div>
          <div className="journey__pdf">
            <div className="journey__pdf-title"><button ref={letterTriggerRef} type="button" aria-expanded={letterOpen} aria-haspopup="dialog" aria-controls="journey-pdf-preview" onClick={() => setLetterOpen(true)}><FileText size={18} /><span><strong>Your full offer letter</strong><small>Show preview</small></span><ChevronDown size={18} aria-hidden="true" /></button><a href={staticAsset('offer-letter-sample.pdf')} target="_blank" rel="noopener noreferrer"><Eye size={17} /> View PDF</a></div>
          </div>
          <div className="journey__offer-actions"><button className="journey__button journey__button--primary" type="button" onClick={acceptOffer}>Accept offer <ArrowRight size={19} /></button><button ref={declineTriggerRef} className="journey__button journey__button--outline" type="button" onClick={() => setDeclineOpen(true)}>Decline offer</button></div>
        </div>
      </div>
      <aside className="journey__offer-visual" aria-label="A glimpse of what is ahead">
        <img src={staticAsset('graduate-offer.png')} alt="Graduate celebrating with a diploma folder on campus" />
        <div className="journey__diploma" aria-label="Illustrative diploma preview"><div className="journey__diploma-inner"><div className="journey__diploma-corners" aria-hidden="true" /><div className="journey__diploma-heading"><span className="journey__diploma-seal" aria-hidden="true">N</span><div><span>Northbridge University</span><small>ILLUSTRATIVE DIPLOMA PREVIEW</small></div></div><p className="journey__diploma-award">In recognition of the completion of the prescribed course of study</p><h2>Jordan Lee</h2><p className="journey__diploma-degree">Bachelor of Science<br />Computer Science</p><div className="journey__diploma-rule" /><div className="journey__diploma-foot"><span>Class of 2027</span><span>✦</span><span>Northbridge</span></div></div></div>
        <blockquote className="journey__quote"><span aria-hidden="true">“</span><p>Meek young men grow up in libraries, believing it their duty to accept the views which their fathers have written down for them.</p><footer>Ralph Waldo Emerson <span>(A.B. 1821, LL.D.)</span></footer></blockquote>
      </aside>
    </section>}

    {chapter === 'access' && <section className="journey__access journey__split" aria-labelledby="motion-title">
      <div className="journey__access-content">
        <button className="journey__back" type="button" onClick={() => go('offer')}><ArrowLeft size={17} /> Back to offer</button>
        <div className="journey__overline">02 / Make it yours</div>
        <h1 id="motion-title" tabIndex={-1} ref={titleRef}>How will you sign in next time<span>?</span></h1>
        <p className="journey__section-intro">Choose the way you’d like to return to your enrollment. Use an address you can access for updates.</p>
        <form className="journey__access-form" onSubmit={saveAccess} noValidate>
          <div className="journey__field journey__field--email"><label htmlFor="journey-email">Email address</label><input ref={emailRef} id="journey-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean((accessAttempted || email) && !emailValid)} aria-describedby="journey-email-hint" /><small id="journey-email-hint" className={accessAttempted && !emailValid ? 'journey__field-error' : ''}>{accessAttempted && !emailValid ? 'Enter a valid email address.' : 'We’ll use this address for enrollment updates.'}</small></div>
          <div className="journey__field journey__field--password"><label htmlFor="journey-password">Create password</label><div className="journey__password"><input ref={passwordRef} id="journey-password" type={passwordVisible ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="12 characters or more" aria-invalid={accessAttempted && password.length < 12} aria-describedby="journey-password-hint" /><button type="button" aria-label={passwordVisible ? 'Hide password' : 'Show password'} onClick={() => setPasswordVisible(!passwordVisible)}>{passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><small id="journey-password-hint" className={accessAttempted && password.length < 12 ? 'journey__field-error' : ''}>{password.length >= 12 ? '✓ 12 characters entered.' : password.length ? String(12 - password.length) + ' more ' + (12 - password.length === 1 ? 'character' : 'characters') + ' needed.' : 'Use at least 12 characters.'}</small></div>
          <div className="journey__field journey__field--confirm"><label htmlFor="journey-confirm">Confirm password</label><input ref={confirmRef} id="journey-confirm" type={passwordVisible ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter it again" aria-invalid={Boolean(confirmPassword && confirmPassword !== password)} aria-describedby={confirmPassword ? 'journey-confirm-hint' : undefined} />{confirmPassword && <small id="journey-confirm-hint" className={confirmPassword === password ? 'journey__field-success' : 'journey__field-error'}>{confirmPassword === password ? '✓ Passwords match.' : 'Passwords do not match yet.'}</small>}</div>
          <button className="journey__button journey__button--primary journey__save" type="submit" disabled={!canTrySave}>Save and continue <ArrowRight size={18} /></button>
          <div className="journey__separator"><span>or continue with</span></div>
          <div className="journey__providers">
            {(['Google', 'Apple', 'Facebook'] as const).map((item) => <button key={item} type="button" onClick={() => chooseProvider(item)} aria-label={'Continue with ' + item}><span className={'journey__provider-logo journey__provider-logo--' + item.toLowerCase()} aria-hidden="true">{item === 'Facebook' ? 'f' : item === 'Apple' ? '●' : 'G'}</span>{item}</button>)}
          </div>
          <p className="journey__provider-footnote">Your college will confirm which sign-in options are available.</p>
        </form>
      </div>
      <div className="journey__access-visual"><img src={staticAsset('campus-access.webp')} alt="A second perspective of the Northbridge University campus" /><div><span>Next stop</span><strong>Make this place yours.</strong></div></div>
    </section>}

    {chapter === 'declined' && <section className="motion-lab__destination" aria-labelledby="motion-title"><div className="journey__overline">Your decision</div><h1 id="motion-title" tabIndex={-1} ref={titleRef}>Thank you for letting us know.</h1><p>Your reason is recorded for this local preview. If you need another look, your offer details are still here.</p><button type="button" className="journey__button journey__button--outline" onClick={() => go('offer')}>Review offer again <ArrowRight size={18} /></button></section>}
    {chapter === 'enrollment' && <section className="motion-lab__destination" aria-labelledby="motion-title"><button type="button" className="motion-lab__back" onClick={() => go('documents')}><ArrowLeft size={18} /> Back to ID card</button><div className="journey__overline">Your enrollment</div><h1 id="motion-title" tabIndex={-1} ref={titleRef}>The next steps are yours.</h1><p>Your ID card details are ready for review. Keep going with the remaining enrollment tasks.</p><div className="motion-lab__destination-grid"><article><span>01</span><h2>Final transcript</h2><p>Prepare your final transcript for university review.</p></article><article><span>02</span><h2>Complete your details</h2><p>Review your contact details and anything the university still needs.</p></article><article><span>03</span><h2>Discover campus life</h2><p>Find the communities and opportunities that interest you.</p><button type="button" onClick={() => go('opportunities')}>Explore campus <ArrowRight size={17} /></button></article></div></section>}
    {chapter === 'opportunities' && <section className="motion-lab__destination" aria-labelledby="motion-title"><button type="button" className="motion-lab__back" onClick={() => go('documents')}><ArrowLeft size={18} /> Back to ID card</button><div className="journey__overline">Life at Northbridge</div><h1 id="motion-title" tabIndex={-1} ref={titleRef}>Find your people. Find your place.</h1><p>Explore the spaces, clubs, and experiences that could make campus feel like yours.</p><div className="motion-lab__opportunities"><article><img src={staticAsset('interest-clubs.png')} alt="Students taking part in a campus club" /><h2>Clubs & communities</h2><p>Follow your interests and meet people who share them.</p></article><article><img src={staticAsset('interest-arts.png')} alt="Students exploring arts on campus" /><h2>Arts & culture</h2><p>Discover creative spaces and ways to take part.</p></article><article><img src={staticAsset('interest-sports.png')} alt="Students enjoying campus sports" /><h2>Sport & movement</h2><p>Find a team, a class, or a new way to unwind.</p></article></div><div className="motion-lab__events"><div><span>THE CAMPUS CALENDAR</span><h2>Moments to look forward to</h2></div><ul><li><strong>Welcome events</strong><span>Meet classmates and find your way around.</span></li><li><strong>Club meetups</strong><span>Try something new with people who get it.</span></li><li><strong>Student showcases</strong><span>See what the community is creating.</span></li></ul></div><button type="button" className="motion-lab__primary" onClick={() => go('enrollment')}>See your enrollments <ArrowRight size={18} /></button></section>}
    <div hidden={chapter !== 'documents'}><IdCardStudio visible={chapter === 'documents'} onBack={() => go('access')} onDestination={go} /></div>

    {accepting && <CollegeLifeTransition scene={acceptScene} onSkip={finishAcceptance} />}
    {provider && <div className="journey__provider-transition" role="status" aria-live="polite">Previewing {provider} sign-in…</div>}

    {chapter === 'offer' && letterOpen && <div className="journey__modal-backdrop journey__letter-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeLetter(); }}><section id="journey-pdf-preview" className="journey__letter-dialog" role="dialog" aria-modal="true" aria-labelledby="journey-letter-title" onKeyDown={(event) => keepDialogFocus(event, closeLetter)}>
      <header className="journey__letter-header"><div><span>YOUR OFFER LETTER</span><h2 id="journey-letter-title">Read the full offer</h2></div><button ref={letterCloseRef} type="button" aria-label="Close offer letter preview" onClick={closeLetter}><X size={21} /></button></header>
      <div className="journey__letter-page"><img src={staticAsset('offer-letter-sample-preview.png')} alt="Complete one-page preview of the sample offer letter" /></div>
      <footer className="journey__letter-actions"><a href={staticAsset('offer-letter-sample.pdf')} target="_blank" rel="noopener noreferrer"><Eye size={17} /> Open PDF</a><a href={staticAsset('offer-letter-sample.pdf')} download="Northbridge-offer-letter.pdf"><Download size={17} /> Download PDF</a></footer>
    </section></div>}

    {declineOpen && <div className="journey__modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDecline(); }}><section className="journey__decline-dialog" role="dialog" aria-modal="true" aria-labelledby="decline-title" onKeyDown={(event) => keepDialogFocus(event, closeDecline)}>
      <button ref={declineCloseRef} className="journey__dialog-close" type="button" onClick={closeDecline} aria-label="Close decline dialog"><X size={20} /></button>
      <span className="journey__decline-symbol">?</span><h2 id="decline-title">Before you go, are you sure?</h2><p>We’d love to understand your decision. Your response helps the university improve the experience for future students.</p>
      <fieldset><legend>What is the main reason?</legend>{['I chose another university', 'The cost is a concern', 'My plans changed', 'Something else'].map((reason) => <label key={reason}><input type="radio" name="decline-reason" value={reason} checked={declineReason === reason} onChange={() => setDeclineReason(reason)} />{reason}</label>)}</fieldset>
      {declineReason === 'Something else' && <label className="journey__other-reason">Tell us more, if you’d like<textarea value={declineOther} onChange={(event) => setDeclineOther(event.target.value)} rows={3} /></label>}
      <div className="journey__decline-actions"><button className="journey__button journey__button--primary" type="button" onClick={closeDecline}>Keep my offer</button><button className="journey__button journey__button--danger" type="button" disabled={!declineReason} onClick={() => { setDeclineOpen(false); go('declined'); }}>Yes, decline offer</button></div>
    </section></div>}
  </main>;
}
