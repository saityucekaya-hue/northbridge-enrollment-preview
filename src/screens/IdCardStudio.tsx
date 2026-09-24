import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, ImagePlus, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { CelebrationShareCard } from '../components/CelebrationShareCard';
import { previewIdentityMatch } from '../lib/identity-preview';

type ImageChoice = { name: string; url: string } | null;
type ImageKind = 'front' | 'back' | 'profile';

type Props = {
  visible: boolean;
  onBack: () => void;
  onDestination: (destination: 'enrollment' | 'opportunities') => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function IdCardStudio({ visible, onBack, onDestination }: Props) {
  const [legalName, setLegalName] = useState('');
  const [front, setFront] = useState<ImageChoice>(null);
  const [back, setBack] = useState<ImageChoice>(null);
  const [photoDraft, setPhotoDraft] = useState<ImageChoice>(null);
  const [photoCrop, setPhotoCrop] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [zoom, setZoom] = useState(1.25);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(30);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [matchStatus, setMatchStatus] = useState<'idle' | 'checking' | 'matched' | 'mismatch'>('idle');
  const [matchMessage, setMatchMessage] = useState('');
  const urls = useRef<string[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoButtonRef = useRef<HTMLButtonElement>(null);
  const completeButtonRef = useRef<HTMLButtonElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropSaveRef = useRef<HTMLButtonElement>(null);
  const firstNextRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; positionX: number; positionY: number } | null>(null);
  const matchRevisionRef = useRef(0);

  useEffect(() => { if (visible) titleRef.current?.focus({ preventScroll: true }); }, [visible]);
  useEffect(() => () => { urls.current.forEach((url) => URL.revokeObjectURL(url)); }, []);
  useEffect(() => { if (cropOpen) cropCanvasRef.current?.focus(); }, [cropOpen]);
  useEffect(() => { if (completeOpen) firstNextRef.current?.focus(); }, [completeOpen]);

  useEffect(() => {
    if (!cropOpen || !photoDraft) return;
    let active = true;
    setPhotoReady(false);
    const image = new Image();
    image.onload = () => { if (active) { imageRef.current = image; drawCrop(); setPhotoReady(true); } };
    image.onerror = () => { if (active) setErrors((current) => ({ ...current, profile: 'This photo could not be opened. Choose another image.' })); };
    image.src = photoDraft.url;
    return () => { active = false; };
  // drawCrop is deliberately called again by the effect below when controls change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropOpen, photoDraft]);

  useEffect(() => { if (cropOpen) drawCrop(); }, [cropOpen, zoom, positionX, positionY]);

  function drawCrop() {
    const canvas = cropCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !image.naturalWidth || !image.naturalHeight) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const { width, height } = canvas;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
    const imageWidth = image.naturalWidth * scale;
    const imageHeight = image.naturalHeight * scale;
    const x = -(imageWidth - width) * positionX / 100;
    const y = -(imageHeight - height) * positionY / 100;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, x, y, imageWidth, imageHeight);
  }

  function invalidateMatch() {
    matchRevisionRef.current += 1;
    setMatchStatus('idle');
    setMatchMessage('');
  }

  function selectImage(kind: ImageKind, file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 10 * 1024 * 1024) {
      setErrors((current) => ({ ...current, [kind]: 'Choose a JPG, PNG or WebP image under 10 MB.' }));
      return;
    }
    const url = URL.createObjectURL(file);
    urls.current.push(url);
    const choice = { name: file.name, url };
    setErrors((current) => ({ ...current, [kind]: '' }));
    invalidateMatch();
    if (kind === 'front') setFront(choice);
    if (kind === 'back') setBack(choice);
    if (kind === 'profile') {
      imageRef.current = null;
      setPhotoReady(false);
      setPhotoDraft(choice);
      setZoom(1.25);
      setPositionX(50);
      setPositionY(30);
      setCropOpen(true);
    }
  }

  function saveCrop() {
    drawCrop();
    const canvas = cropCanvasRef.current;
    if (!canvas || !imageRef.current?.naturalWidth) {
      setErrors((current) => ({ ...current, profile: 'Photo is still loading. Try again.' }));
      return;
    }
    setPhotoCrop(canvas.toDataURL('image/jpeg', .92));
    setPhotoDraft(null);
    setCropOpen(false);
    setErrors((current) => ({ ...current, profile: '' }));
    invalidateMatch();
    window.setTimeout(() => photoButtonRef.current?.focus(), 0);
  }

  function validateDetails() {
    const nextErrors: Record<string, string> = {};
    if (!legalName.trim()) nextErrors.name = 'Enter your full legal name as shown on your ID.';
    if (!photoCrop) nextErrors.profile = 'Choose and crop your profile photo.';
    if (!front) nextErrors.front = 'Add the front of your identity document.';
    if (!back) nextErrors.back = 'Add the back of your identity document.';
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      const controls: Record<string, HTMLElement | null> = { name: nameRef.current, profile: photoButtonRef.current, front: frontInputRef.current, back: backInputRef.current };
      controls[first]?.focus();
      return false;
    }
    return true;
  }

  async function finishCard() {
    if (matchStatus === 'checking' || !validateDetails() || !front || !back) return;
    const revision = ++matchRevisionRef.current;
    setMatchStatus('checking');
    setMatchMessage('');
    try {
      const result = await previewIdentityMatch({ legalName, frontFileName: front.name, backFileName: back.name });
      if (revision !== matchRevisionRef.current) return;
      setMatchStatus(result.status);
      setMatchMessage(result.message);
      if (result.status === 'matched') setCompleteOpen(true);
    } catch {
      if (revision !== matchRevisionRef.current) return;
      setMatchStatus('mismatch');
      setMatchMessage('We could not check your details. Please try again.');
    }
  }

  function closeCrop() { setCropOpen(false); setPhotoDraft(null); window.setTimeout(() => photoButtonRef.current?.focus(), 0); }
  function closeComplete() { setCompleteOpen(false); window.setTimeout(() => completeButtonRef.current?.focus(), 0); }
  function firstName() { return legalName.trim().split(/\s+/)[0] || 'Jordan'; }

  function keepFocusInDialog(event: KeyboardEvent<HTMLElement>, close: () => void) {
    if (event.key === 'Escape') { close(); return; }
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  return <section className="id-studio" aria-labelledby="motion-title">
    <div className="id-studio__form">
      <button type="button" className="motion-lab__back" onClick={onBack}><ArrowLeft size={18} /> Back</button>
      <p className="motion-lab__chapter-number">03 / Your first enrollment step</p>
      <h1 id="motion-title" tabIndex={-1} ref={titleRef}>Create your ID Card.</h1>
      <p className="id-studio__intro">Make this card yours. Add a photo and your legal name, then show us the front and back of your ID.</p>

      <div className="id-studio__identity-row">
        <div className="id-studio__profile" aria-label="Your student profile">
          <button ref={photoButtonRef} type="button" className="id-studio__avatar" aria-label={photoCrop ? 'Replace profile photo' : 'Choose profile photo'} onClick={() => photoInputRef.current?.click()}>
            {photoCrop ? <img src={photoCrop} alt="" /> : <Camera size={31} aria-hidden="true" />}
            <span className="id-studio__avatar-camera"><Camera size={16} aria-hidden="true" /></span>
          </button>
          <input ref={photoInputRef} className="id-studio__file-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload profile photo" onChange={(event) => { selectImage('profile', event.target.files?.[0]); event.target.value = ''; }} />
          {errors.profile && <p className="id-studio__error">{errors.profile}</p>}
        </div>
        <div className="id-studio__field id-studio__legal-field">
          <label htmlFor="id-legal-name">Full legal name <span>*</span></label>
          <input id="id-legal-name" ref={nameRef} value={legalName} onChange={(event) => { setLegalName(event.target.value); invalidateMatch(); setErrors((current) => ({ ...current, name: '' })); }} placeholder="Exactly as shown on your identity document" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'id-name-error' : undefined} />
          {errors.name && <p className="id-studio__error" id="id-name-error">{errors.name}</p>}
        </div>
      </div>

      <div className="id-studio__documents-heading"><h2>Identity document</h2><p>Photograph the full front and back. Make every edge readable.</p></div>
      <div className="id-studio__document-pair">
        <label className="id-studio__document-tile" data-filled={Boolean(front)} data-invalid={Boolean(errors.front)}>
          {front ? <img src={front.url} alt="Selected front of identity document" /> : <ImagePlus size={28} aria-hidden="true" />}
          <strong>{front ? 'Front selected' : 'Front side'}</strong><span>{front?.name || 'Choose photo'}</span>
          <input ref={frontInputRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload ID front" aria-invalid={Boolean(errors.front)} aria-describedby={errors.front ? 'id-front-error' : undefined} onChange={(event) => { selectImage('front', event.target.files?.[0]); event.target.value = ''; }} />
        </label>
        <label className="id-studio__document-tile" data-filled={Boolean(back)} data-invalid={Boolean(errors.back)}>
          {back ? <img src={back.url} alt="Selected back of identity document" /> : <ImagePlus size={28} aria-hidden="true" />}
          <strong>{back ? 'Back selected' : 'Back side'}</strong><span>{back?.name || 'Choose photo'}</span>
          <input ref={backInputRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload ID back" aria-invalid={Boolean(errors.back)} aria-describedby={errors.back ? 'id-back-error' : undefined} onChange={(event) => { selectImage('back', event.target.files?.[0]); event.target.value = ''; }} />
        </label>
      </div>
      {errors.front && <p className="id-studio__error" id="id-front-error">{errors.front}</p>}
      {errors.back && <p className="id-studio__error" id="id-back-error">{errors.back}</p>}
      <button ref={completeButtonRef} className="motion-lab__primary id-studio__complete" type="button" disabled={matchStatus === 'checking'} onClick={() => void finishCard()}>{matchStatus === 'checking' ? 'Checking your details…' : 'Finish my ID card'} <ArrowRight size={19} /></button>
      {matchStatus === 'mismatch' && <p className="id-studio__error id-studio__finish-error" role="alert">{matchMessage}</p>}
    </div>

    <aside className="id-studio__preview" aria-label="Student ID card preview">
      <div className="id-studio__preview-heading"><div><span>Your card</span><h2>Front & back preview</h2></div><span className="id-studio__live-dot">Live preview</span></div>
      <div className="id-studio__card-stack">
        <div className="id-studio__face-label">Front</div>
        <div className="id-studio__card id-studio__card--front">
          <div className="id-studio__card-top"><strong>Northbridge <span>University</span></strong><small>STUDENT ID</small></div>
          <div className="id-studio__card-bottom"><div className="id-studio__card-person"><span>STUDENT NAME</span><strong>{legalName || 'Your full legal name'}</strong><small>BSc Computer Science</small></div><div className="id-studio__card-photo">{photoCrop ? <img src={photoCrop} alt="Cropped student card portrait" /> : <Camera size={37} aria-hidden="true" />}</div></div>
          <div className="id-studio__card-wave" aria-hidden="true" />
        </div>
        <div className="id-studio__face-label">Back</div>
        <div className="id-studio__card id-studio__card--back">
          <div className="id-studio__card-back-top"><strong>Northbridge University</strong><span>STUDENT ID</span></div>
          <div className="id-studio__card-stripe" aria-hidden="true" />
          <div className="id-studio__card-back-body"><div><span>CARDHOLDER</span><strong>{legalName || 'Your full legal name'}</strong><small>Valid when issued by the university</small></div><div className="id-studio__card-pattern" aria-hidden="true" /></div>
        </div>
      </div>
    </aside>

    {cropOpen && <div className="id-studio__overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCrop(); }}><section className="id-studio__crop-dialog" role="dialog" aria-modal="true" aria-label="Edit profile photo" onKeyDown={(event) => keepFocusInDialog(event, closeCrop)}>
      <header className="id-studio__crop-header"><div><span>PROFILE PHOTO</span><h2>Edit photo</h2></div><button className="id-studio__close" type="button" onClick={closeCrop} aria-label="Close photo editor"><X size={21} /></button></header>
      <div className="id-studio__crop-stage">
        <canvas ref={cropCanvasRef} width="600" height="600" tabIndex={0} className="id-studio__crop-canvas" aria-label="Profile photo crop preview. Drag to move, or use arrow keys." onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); setPositionX(clamp(positionX - 5, 0, 100)); } if (event.key === 'ArrowRight') { event.preventDefault(); setPositionX(clamp(positionX + 5, 0, 100)); } if (event.key === 'ArrowUp') { event.preventDefault(); setPositionY(clamp(positionY - 5, 0, 100)); } if (event.key === 'ArrowDown') { event.preventDefault(); setPositionY(clamp(positionY + 5, 0, 100)); } }} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { x: event.clientX, y: event.clientY, positionX, positionY }; }} onPointerMove={(event) => { const drag = dragRef.current; if (!drag) return; const bounds = event.currentTarget.getBoundingClientRect(); setPositionX(clamp(drag.positionX - (event.clientX - drag.x) / bounds.width * 100, 0, 100)); setPositionY(clamp(drag.positionY - (event.clientY - drag.y) / bounds.height * 100, 0, 100)); }} onPointerUp={() => { dragRef.current = null; }} />
        <span className="id-studio__crop-ring" aria-hidden="true" />
      </div>
      <p className="id-studio__crop-hint">Drag to center your face inside the circle.</p>
      <div className="id-studio__crop-actions">
        <div className="id-studio__zoom"><button type="button" aria-label="Zoom out" onClick={() => setZoom((current) => clamp(Number((current - .1).toFixed(2)), 1, 3))}><Minus size={17} /></button><input aria-label="Zoom photo" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><button type="button" aria-label="Zoom in" onClick={() => setZoom((current) => clamp(Number((current + .1).toFixed(2)), 1, 3))}><Plus size={17} /></button><output>{Math.round(zoom * 100)}%</output></div>
        <button type="button" className="id-studio__reset" aria-label="Reset photo position" onClick={() => { setZoom(1.25); setPositionX(50); setPositionY(30); }}><RotateCcw size={17} /></button>
        <button ref={cropSaveRef} type="button" className="motion-lab__primary" disabled={!photoReady} onClick={saveCrop}>{photoReady ? 'Save photo' : 'Loading photo…'}</button>
      </div>
    </section></div>}

    {completeOpen && <div className="id-studio__overlay"><section className="id-studio__celebration" role="dialog" aria-modal="true" aria-label="Your first enrollment step is complete" onKeyDown={(event) => keepFocusInDialog(event, closeComplete)}>
      <div className="id-studio__confetti" aria-hidden="true">{Array.from({ length: 30 }, (_, index) => <span key={index} style={{ '--confetti-x': `${(index * 37) % 100}%`, '--confetti-delay': `${(index % 8) * 75}ms`, '--confetti-rotate': `${(index * 41) % 360}deg` } as React.CSSProperties} />)}</div>
      <button type="button" className="id-studio__close" aria-label="Close celebration" onClick={closeComplete}><X size={21} /></button>
      <div className="id-studio__celebration-copy">
        <div className="id-studio__success-mark"><Check size={30} /></div>
        <p className="id-studio__success-kicker">A moment worth celebrating</p>
        <h2>Nice one, {firstName()}!</h2>
        <p>You’ve taken your first step toward Northbridge. Your ID card details are ready for university review. Where do you want to go next?</p>
        <div className="id-studio__success-actions"><button ref={firstNextRef} type="button" className="motion-lab__primary" onClick={() => { setCompleteOpen(false); onDestination('enrollment'); }}>See your pending enrollment tasks <ArrowRight size={18} /></button><button type="button" className="id-studio__secondary" onClick={() => { setCompleteOpen(false); onDestination('opportunities'); }}>Explore campus opportunities & events <ArrowRight size={18} /></button></div>
      </div>
      <CelebrationShareCard />
    </section></div>}
  </section>;
}
