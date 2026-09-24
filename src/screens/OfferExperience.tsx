import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight, CircleHelp, FileText, Info, Menu, MessageCircle, Sparkles } from 'lucide-react';
import { themes, type ThemeId } from '../lib/demo';

// These illustrative details are not part of the current platform offer summary.
// A connected offer must receive its terms and amounts from a versioned server contract.
const sampleOffer = {
  student: 'Jordan Lee',
  program: 'BSc Computer Science',
  qualification: 'Bachelor of Science',
  start: 'Autumn 2027',
  campus: 'Main campus',
  studyMode: 'Full time',
  condition: 'Final transcript required',
  deadline: '15 June 2027',
  academicYear: '2027–28',
  tuition: '$24,800',
  mandatoryFees: '$1,200',
  directCharges: '$26,000',
  deposit: '$500',
  depositDeadline: '30 June 2027',
};

const overview = [
  ['Student', sampleOffer.student],
  ['Program', sampleOffer.program],
  ['Qualification', sampleOffer.qualification],
  ['Start', sampleOffer.start],
  ['Campus', sampleOffer.campus],
  ['Study mode', sampleOffer.studyMode],
];

type OfferProps = {
  themeId: ThemeId;
  onTheme: (theme: ThemeId) => void;
  onHelp: () => void;
  onAccept: () => void;
};

export function OfferScreen({ themeId, onTheme, onHelp, onAccept }: OfferProps) {
  const theme = themes[themeId];
  const [letterOpen, setLetterOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDiploma, setShowDiploma] = useState(true);

  return <div className="offer-page offer-page-detailed">
    <div className="offer-content">
      <header className="offer-header">
        <strong>{theme.name}</strong>
        <div>
          <label className="theme-switch"><span>Sample university</span><select aria-label="Preview university" value={themeId} onChange={(event) => onTheme(event.target.value as ThemeId)}><option value="northbridge">Northbridge</option><option value="audentra">Audentra</option></select></label>
          <button className="plain-button" type="button" onClick={onHelp}><CircleHelp size={19} aria-hidden="true" /> Help</button>
          <button className="offer-menu-icon" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Open menu" aria-expanded={menuOpen} aria-controls="offer-mobile-menu"><Menu size={23} aria-hidden="true" /></button>
        </div>
        {menuOpen && <nav id="offer-mobile-menu" className="offer-mobile-menu" aria-label="Preview menu">
          <span>Sample university</span>
          <button type="button" aria-current={themeId === 'northbridge' ? 'page' : undefined} onClick={() => { setMenuOpen(false); onTheme('northbridge'); }}>Northbridge</button>
          <button type="button" aria-current={themeId === 'audentra' ? 'page' : undefined} onClick={() => { setMenuOpen(false); onTheme('audentra'); }}>Audentra</button>
          <button type="button" onClick={() => { setMenuOpen(false); onHelp(); }}>Help</button>
        </nav>}
      </header>

      <section className="offer-copy" aria-labelledby="offer-title">
        <p className="offer-kicker">My offer</p>
        <h1 id="offer-title">Jordan, this is your offer.</h1>
        <p className="lead">A place to begin at {theme.name}. Review the academic terms, condition, and illustrative costs before you decide.</p>

        <article className="offer-card offer-card-detailed" aria-label="Sample conditional offer details">
          <div className="offer-card-top"><span>Conditional offer of a place</span><strong>{theme.name}</strong></div>
          <dl className="offer-data offer-overview">{overview.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>

          <div className="offer-decision-terms">
            <div><span>Offer condition</span><strong>{sampleOffer.condition}</strong><small>Submit your final transcript for review before enrollment can be confirmed.</small></div>
            <div><span>Respond by</span><strong>{sampleOffer.deadline}</strong><small>This response deadline is part of the sample offer.</small></div>
          </div>

          <section className="offer-costs" aria-labelledby="offer-cost-title">
            <div className="offer-section-heading"><div><p>Illustrative estimate · {sampleOffer.academicYear}</p><h2 id="offer-cost-title">Tuition & fees</h2></div><span>Sample USD amounts</span></div>
            <dl className="offer-cost-list">
              <div><dt>Annual tuition</dt><dd>{sampleOffer.tuition}</dd></div>
              <div><dt>Mandatory fees</dt><dd>{sampleOffer.mandatoryFees}</dd></div>
              <div className="offer-cost-total"><dt>Estimated direct charges</dt><dd>{sampleOffer.directCharges}</dd></div>
            </dl>
            <p className="offer-cost-note">All amounts are sample USD figures. Housing, meals, books, and personal expenses are not included. Scholarship and aid are not yet confirmed and have not been deducted.</p>
          </section>

          <div className="offer-deposit"><strong>Enrollment deposit · {sampleOffer.deposit}</strong><p>Illustratively due {sampleOffer.depositDeadline} after acceptance and applied to first term charges. Official payment and refund terms would be provided by the university.</p></div>

          <div className="offer-card-bottom">
            <p>Read the full sample letter and review every term before deciding. Acceptance here cannot reserve a place.</p>
            <div className="offer-actions">
              <button className="button button-primary" type="button" onClick={() => setAcceptOpen(true)}>Accept sample offer <ArrowRight size={20} aria-hidden="true" /></button>
              <button className="text-link" type="button" onClick={() => setLetterOpen(true)}><FileText size={19} aria-hidden="true" /> Read full offer letter</button>
              <button className="text-link" type="button" onClick={onHelp}><MessageCircle size={19} aria-hidden="true" /> I need help deciding</button>
            </div>
          </div>
        </article>
      </section>
    </div>

    <aside className="future-stage" aria-label="Illustrative diploma preview">
      <img className="future-campus" src={theme.image} alt="" />
      <div className="future-stage-content">
        <div className="future-stage-heading"><Sparkles size={19} aria-hidden="true" /><span>Your future, imagined</span></div>
        <h2>One step closer to your professional career.</h2>
        <p>The offer is a beginning. Your degree is something you’ll earn along the way.</p>
        <div className={`diploma-preview ${showDiploma ? 'is-visible' : 'is-hidden'}`} aria-hidden={!showDiploma}>
          <div className="diploma-border"><span className="diploma-caption">Illustrative diploma preview · Not a credential</span><span className="diploma-mark" aria-hidden="true">✦</span><strong className="diploma-institution">{theme.name}</strong><span className="diploma-divider" /><span className="diploma-intro">A future achievement for</span><strong className="diploma-name">Jordan Lee</strong><span className="diploma-degree">Bachelor of Science<br />in Computer Science</span><span className="diploma-footer">A vision of what could come next</span></div>
        </div>
        <button className="future-toggle" type="button" aria-pressed={showDiploma} onClick={() => setShowDiploma((value) => !value)}>{showDiploma ? 'See the campus' : 'Preview sample diploma'} <ArrowRight size={17} aria-hidden="true" /></button>
      </div>
    </aside>

    {letterOpen && <OfferDialog title="Your full sample offer" onClose={() => setLetterOpen(false)}>
      <p className="offer-kicker">Sample offer letter</p>
      <h2 id="offer-dialog-title">Your full sample offer</h2>
      <p>Dear Jordan Lee,</p>
      <p>{theme.name} offers you a conditional place in {sampleOffer.program}, leading to a {sampleOffer.qualification}. Study is full time at {sampleOffer.campus}, beginning {sampleOffer.start}.</p>
      <p><strong>Condition:</strong> Submit your final transcript for review. The university must confirm all required enrollment steps before a place is reserved.</p>
      <p><strong>Respond by:</strong> {sampleOffer.deadline}.</p>
      <p><strong>Illustrative {sampleOffer.academicYear} costs:</strong> {sampleOffer.tuition} annual tuition plus {sampleOffer.mandatoryFees} mandatory fees, for {sampleOffer.directCharges} estimated direct charges. Housing, meals, books, and personal expenses are extra. Aid is not yet confirmed.</p>
      <p><strong>Illustrative deposit:</strong> {sampleOffer.deposit}, due {sampleOffer.depositDeadline} after acceptance and applied to first term charges. Official payment and refund terms would be supplied by the university.</p>
      <p className="preview-notice"><Info size={20} aria-hidden="true" /> This entire letter is fictional. It has no legal effect, and its amounts are not a quote.</p>
      <button className="button button-primary" type="button" onClick={() => setLetterOpen(false)}>Back to your offer</button>
    </OfferDialog>}

    {acceptOpen && <OfferDialog title="Review your sample offer" onClose={() => setAcceptOpen(false)}>
      <p className="offer-kicker">Before you continue</p>
      <h2 id="offer-dialog-title">Review your sample offer.</h2>
      <p>This conditional {sampleOffer.program} offer requires a final transcript. The response deadline is {sampleOffer.deadline}; the {sampleOffer.academicYear} tuition and fee estimate is {sampleOffer.directCharges}, before other costs or aid.</p>
      <p className="preview-notice"><Info size={20} aria-hidden="true" /> This is a local preview. No offer is accepted by a real university and no place is reserved.</p>
      <label className="checkbox-row"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} /> I have reviewed the sample offer, condition, deadline, and estimated costs.</label>
      <button className="button button-primary full" type="button" disabled={!reviewed} onClick={() => { setAcceptOpen(false); onAccept(); }}>Continue with sample acceptance <ArrowRight size={18} aria-hidden="true" /></button>
    </OfferDialog>}
  </div>;
}

function OfferDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.body.style.overflow = oldOverflow; previous?.focus(); };
  }, []);
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') { onClose(); return; }
    if (event.key !== 'Tab') return;
    const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]');
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className="offer-dialog" role="dialog" aria-modal="true" aria-label={title} onKeyDown={handleKeyDown}>
      <button ref={closeRef} className="dialog-close" type="button" onClick={onClose} aria-label={`Close ${title.toLowerCase()}`}>×</button>
      {children}
    </section>
  </div>;
}
