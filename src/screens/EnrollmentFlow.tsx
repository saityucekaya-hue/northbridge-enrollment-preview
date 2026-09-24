import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, FileImage, FileText, FolderOpen, IdCard, Info, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { themes, validateDocument, type DemoDocument, type DemoState, type DocumentKind } from '../lib/demo';

export function EnrollmentScreen({ state, onStart, onLater }: { state: DemoState; onStart: () => void; onLater: () => void }) {
  const theme = themes[state.theme];
  return <div className="flow-page enrollment-page"><div className="accepted-banner"><ShieldCheck size={28} aria-hidden="true" /><div><strong>Your sample offer is accepted</strong><span>Welcome to {theme.name}. This is a local preview, not a university record.</span></div></div><p className="flow-eyebrow">Your {theme.name} journey</p><h1>Ready to start enrollment?</h1><p className="lead">Begin with two easy-to-find items. Save and return any time.</p><div className="enrollment-intro-list"><div className="enrollment-intro-row"><span><IdCard size={24} aria-hidden="true" /></span><div><strong>Government ID card</strong><p>Helps confirm your identity. JPG, PNG, or PDF.</p></div><ArrowRight size={20} aria-hidden="true" /></div><div className="enrollment-intro-row"><span><UserRound size={24} aria-hidden="true" /></span><div><strong>Profile photo</strong><p>Helps the university recognise you. JPG or PNG.</p></div><ArrowRight size={20} aria-hidden="true" /></div></div><div className="next-explanation"><h2>What happens next</h2><ol><li><span>1</span> Add these items</li><li><span>2</span> See remaining tasks</li><li><span>3</span> Complete them to reserve your place</li></ol></div><div className="flow-actions"><button className="button button-primary" type="button" onClick={onStart}>Start enrollment <ArrowRight size={19} aria-hidden="true" /></button><button className="text-link" type="button" onClick={onLater}>Maybe later</button></div></div>;
}

export function DocumentsScreen({ state, onSelect, onContinue, onLater }: { state: DemoState; onSelect: (kind: DocumentKind, file: File, source: 'camera' | 'file') => void; onContinue: () => void; onLater: () => void }) {
  return <div className="flow-page documents-page"><div className="enrollment-meter"><span>Enrollment · 1 of 2</span><div><i /></div></div><h1>Let’s get the easy items out of the way.</h1><p className="lead">Start with a photo ID and a profile photo. Save and return later.</p><div className="document-stack"><DocumentCard kind="governmentId" document={state.governmentId} onSelect={onSelect} /><DocumentCard kind="profilePhoto" document={state.profilePhoto} onSelect={onSelect} /></div><p className="privacy-note"><LockKeyhole size={20} aria-hidden="true" /> In a connected portal, files would be private and reviewed by authorised staff after submission. In this preview, files stay on your device.</p><div className="document-actions"><button className="button button-primary full" type="button" onClick={onContinue}>Continue to tasks <ArrowRight size={19} aria-hidden="true" /></button><button className="text-link" type="button" onClick={onLater}>I’ll add these later</button></div></div>;
}

function DocumentCard({ kind, document, onSelect }: { kind: DocumentKind; document: DemoDocument; onSelect: (kind: DocumentKind, file: File, source: 'camera' | 'file') => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const title = kind === 'governmentId' ? 'Government ID card' : 'Profile photo';
  const isPhoto = kind === 'profilePhoto';
  const accept = isPhoto ? '.jpg,.jpeg,.png,image/jpeg,image/png' : '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function receive(file: File | undefined, source: 'camera' | 'file') {
    if (!file) return;
    const nextError = validateDocument(file, kind);
    setError(nextError ?? '');
    if (nextError) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file.type.startsWith('image/') && URL.createObjectURL ? URL.createObjectURL(file) : '');
    onSelect(kind, file, source);
  }
  return <section className="document-card" aria-label={title}><div className="document-card-heading"><span className="document-icon">{isPhoto ? <UserRound size={25} aria-hidden="true" /> : <IdCard size={25} aria-hidden="true" />}</span><div><h2>{title}</h2><p>{isPhoto ? 'Used for your student profile' : 'Used for identity review'}</p></div><span className={`document-status ${document.state !== 'empty' ? 'has-file' : ''}`}>{document.state === 'empty' ? 'Not added yet' : document.state === 'needs-reselect' ? 'Choose again' : 'Selected locally'}</span></div><div className="document-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); receive(event.dataTransfer.files[0], 'file'); }}>
      {preview ? <img src={preview} alt={`${title} selected preview`} /> : isPhoto ? <UserRound size={46} strokeWidth={1.5} aria-hidden="true" /> : <FileText size={46} strokeWidth={1.5} aria-hidden="true" />}
      <strong>{document.state === 'empty' ? isPhoto ? 'Add your photo' : 'Add a photo of your ID' : document.name}</strong><span>{document.state === 'needs-reselect' ? 'File contents are not saved in this demo. Choose it again.' : document.state === 'selected' ? 'Selected on this device · Not uploaded' : isPhoto ? 'JPG or PNG' : 'JPG, PNG, or PDF (max 10 MB)'}</span>
    </div><div className="document-buttons"><button className="document-option camera-option" type="button" onClick={() => cameraInput.current?.click()}><Camera size={22} aria-hidden="true" /> Take photo</button><button className="document-option" type="button" onClick={() => fileInput.current?.click()}>{isPhoto ? <FileImage size={22} aria-hidden="true" /> : <FolderOpen size={22} aria-hidden="true" />} {isPhoto ? 'Choose photo' : 'Choose file'}</button></div>
    <input ref={fileInput} className="visually-hidden-file" aria-label={`Choose ${isPhoto ? 'profile photo' : 'government ID'} file`} type="file" accept={accept} onChange={(event) => receive(event.target.files?.[0], 'file')} />
    <input ref={cameraInput} className="visually-hidden-file" aria-label={isPhoto ? 'Take profile photo' : 'Take government ID photo'} type="file" accept="image/*" capture={isPhoto ? 'user' : 'environment'} onChange={(event) => receive(event.target.files?.[0], 'camera')} />
    {error && <p className="field-error" role="alert">{error}</p>}
  </section>;
}

export function NextStepsScreen({ state, onTasks, onExplore, onStartEnrollment }: { state: DemoState; onTasks: () => void; onExplore: () => void; onStartEnrollment: () => void }) {
  const theme = themes[state.theme];
  return <div className="next-page"><div className="next-content"><div className="next-status"><span><Check size={21} aria-hidden="true" /> Offer accepted in preview</span><i /><span>{state.enrollmentStarted ? 'Enrollment started in preview' : 'Enrollment can start later'}</span></div><h1>{state.enrollmentStarted ? 'Thanks for getting started, Jordan.' : 'Your sample offer is saved, Jordan.'}</h1><p className="lead">{state.enrollmentStarted ? 'Complete the remaining enrollment tasks to reserve your place.' : 'You can begin enrollment whenever you’re ready. Your place is not yet reserved.'}</p><div className="next-info"><Info size={33} aria-hidden="true" /><p>{state.enrollmentStarted ? 'Your documents may still need review.' : 'Your remaining enrollment tasks are still ahead.'}</p></div><div className="next-buttons">{state.enrollmentStarted ? <button className="button button-primary full" type="button" onClick={onTasks}>View enrollment tasks <ArrowRight size={20} aria-hidden="true" /></button> : <button className="button button-primary full" type="button" onClick={onStartEnrollment}>Start enrollment <ArrowRight size={20} aria-hidden="true" /></button>}<button className="button button-outline full" type="button" onClick={onExplore}>Explore campus & events <ArrowRight size={20} aria-hidden="true" /></button></div><p className="preview-detail">These destinations and statuses are preview-only. No place is reserved by this demo.</p></div><div className="next-photo"><img src={theme.image} alt={`${theme.name} campus`} /><span>{theme.name}</span></div></div>;
}

export function TasksScreen({ state, onDocuments, onBack }: { state: DemoState; onDocuments: () => void; onBack: () => void }) {
  const tasks = [
    { title: 'Government ID card', status: state.governmentId.state === 'selected' ? 'Selected locally · not submitted' : 'Not submitted' },
    { title: 'Profile photo', status: state.profilePhoto.state === 'selected' ? 'Selected locally · not submitted' : 'Not submitted' },
    { title: 'Final transcript', status: 'Still required' },
    { title: 'Remaining enrollment steps', status: 'Preview only' },
  ];
  return <div className="flow-page task-page"><button className="text-link" type="button" onClick={onBack}><ArrowLeft size={17} /> Back to next steps</button><p className="flow-eyebrow">Enrollment tasks</p><h1>What’s left to do.</h1><p className="lead">Your offer is conditional. These sample tasks show why a place is not reserved yet.</p><div className="task-list">{tasks.map(({ title, status }) => <div key={title}><span className="task-empty" /><strong>{title}</strong><span>{status}</span></div>)}</div><button className="button button-primary" type="button" onClick={onDocuments}>Add ID or profile photo <ArrowRight size={18} aria-hidden="true" /></button><p className="preview-detail">No document was submitted or approved in this local preview.</p></div>;
}

export function DiscoverScreen({ state, onBack }: { state: DemoState; onBack: () => void }) {
  const tiles = [{ name: 'Clubs', image: '/interest-clubs.png' }, { name: 'Arts', image: '/interest-arts.png' }, { name: 'Sports', image: '/interest-sports.png' }, { name: 'Quiet spaces', image: '/interest-quiet.png' }];
  return <div className="flow-page discover-page"><button className="text-link" type="button" onClick={onBack}><ArrowLeft size={17} /> Back to next steps</button><p className="flow-eyebrow">Campus & events preview</p><h1>Find your kind of place.</h1><p className="lead">Explore what campus life at {themes[state.theme].name} could look like. These are sample destinations, not live events or registrations.</p><div className="discovery-grid">{tiles.map(({ name, image }) => <article key={name}><img src={image} alt="" /><div><h2>{name}</h2><p>{state.interests.includes(name) ? 'You selected this interest.' : 'A place to explore when you arrive.'}</p></div></article>)}</div></div>;
}
