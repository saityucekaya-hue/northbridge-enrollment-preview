import { useId, useState } from 'react';
import { ArrowUpRight, Check, Copy, Download, GraduationCap, Image as ImageIcon, Share2, Smartphone, Sparkles } from 'lucide-react';
import './celebration-share-card.css';

type Format = 'story' | 'post';

type CelebrationShareCardProps = {
  institutionName?: string;
};

const PHOTO_PATH = `${import.meta.env.BASE_URL}campus-northbridge.png`;
const FORMATS: Record<Format, { width: number; height: number; label: string }> = {
  story: { width: 1080, height: 1920, label: 'Story' },
  post: { width: 1080, height: 1080, label: 'Post' },
};

function loadPhoto(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const photo = new Image();
    photo.onload = () => resolve(photo);
    photo.onerror = () => resolve(null);
    photo.src = PHOTO_PATH;
  });
}

function drawCover(context: CanvasRenderingContext2D, photo: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
  const drawnWidth = photo.naturalWidth * scale;
  const drawnHeight = photo.naturalHeight * scale;
  context.drawImage(photo, (width - drawnWidth) * .28, (height - drawnHeight) / 2, drawnWidth, drawnHeight);
}

function drawStar(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.beginPath();
  context.moveTo(x, y - radius);
  context.quadraticCurveTo(x + radius * .18, y - radius * .18, x + radius, y);
  context.quadraticCurveTo(x + radius * .18, y + radius * .18, x, y + radius);
  context.quadraticCurveTo(x - radius * .18, y + radius * .18, x - radius, y);
  context.quadraticCurveTo(x - radius * .18, y - radius * .18, x, y - radius);
  context.closePath();
  context.fill();
}

async function makeSharePng(format: Format, institutionName: string): Promise<Blob> {
  const { width, height } = FORMATS[format];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image export is unavailable in this browser.');

  context.fillStyle = '#26334e';
  context.fillRect(0, 0, width, height);

  const photo = await loadPhoto();
  if (photo) drawCover(context, photo, width, height);

  const shade = context.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, 'rgba(8, 37, 43, .62)');
  shade.addColorStop(.35, 'rgba(8, 37, 43, .03)');
  shade.addColorStop(.62, 'rgba(8, 37, 43, .22)');
  shade.addColorStop(1, 'rgba(6, 28, 38, .96)');
  context.fillStyle = shade;
  context.fillRect(0, 0, width, height);

  // The exported image mirrors the public preview. It never contains student identity or ID imagery.
  context.fillStyle = '#e2edb7';
  drawStar(context, width - 138, format === 'story' ? 315 : 235, 52);
  drawStar(context, width - 215, format === 'story' ? 394 : 310, 15);

  const margin = 86;
  context.textBaseline = 'top';
  context.textAlign = 'left';
  context.fillStyle = '#fff';
  context.font = '700 39px Montserrat, Arial, sans-serif';
  context.fillText(institutionName, margin, format === 'story' ? 112 : 76, width - 2 * margin);
  const arrivalY = format === 'story' ? 1030 : 430;
  context.fillStyle = 'rgba(255,253,242,.94)';
  context.beginPath();
  context.roundRect(margin, arrivalY, 420, 76, 38);
  context.fill();
  context.fillStyle = '#174e50';
  context.font = '800 22px Montserrat, Arial, sans-serif';
  context.fillText('THE GATES ARE OPEN', margin + 27, arrivalY + 26, 365);
  context.fillStyle = '#e2edb7';
  context.font = '700 29px Montserrat, Arial, sans-serif';
  context.fillText('MOMENT UNLOCKED  ✦', margin, height - (format === 'story' ? 470 : 445));

  context.fillStyle = '#fff';
  context.font = '700 106px Montserrat, Arial, sans-serif';
  context.fillText('My next chapter', margin, height - (format === 'story' ? 388 : 375), width - 2 * margin);
  context.font = 'italic 110px Georgia, serif';
  context.fillText('starts here.', margin, height - (format === 'story' ? 270 : 260), width - 2 * margin);

  context.fillStyle = 'rgba(255,255,255,.88)';
  context.font = '600 25px Montserrat, Arial, sans-serif';
  context.fillText('THE JOURNEY IS JUST BEGINNING', margin, height - 89, width - 2 * margin);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The image could not be created.')), 'image/png');
  });
}

function downloadPng(blob: Blob, format: Format) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `my-next-chapter-${format}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** A public, shareable milestone card for the local enrollment design preview. */
export function CelebrationShareCard({ institutionName = 'Northbridge University' }: CelebrationShareCardProps) {
  const headingId = useId();
  const [format, setFormat] = useState<Format>('story');
  const [photoAvailable, setPhotoAvailable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const caption = `My next chapter starts here. Excited for what’s ahead at ${institutionName}. ✨`;

  async function exportImage(share: boolean) {
    if (busy) return;
    setBusy(true);
    setFeedback('');
    try {
      const blob = await makeSharePng(format, institutionName);
      if (share && typeof navigator.share === 'function') {
        const file = new File([blob], `my-next-chapter-${format}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My next chapter', text: caption });
          setFeedback('Share options opened. Nothing was posted automatically.');
          return;
        }
      }
      downloadPng(blob, format);
      setFeedback(share ? 'Image downloaded. Upload it to the app you choose.' : `${FORMATS[format].label} image downloaded.`);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setFeedback(error instanceof Error ? error.message : 'The image could not be created.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyCaption() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Copy is unavailable in this browser.');
      await navigator.clipboard.writeText(caption);
      setFeedback('Caption copied.');
    } catch {
      setFeedback('Copy is unavailable in this browser. You can select the caption below.');
    }
  }

  return <section className="celebration-share" aria-labelledby={headingId}>
    <div className="celebration-share__heading">
      <span className="celebration-share__eyebrow"><Sparkles size={15} aria-hidden="true" /> Made to share</span>
      <h3 id={headingId}>A moment for your camera roll.</h3>
      <p>Choose a format, then share or save your milestone card.</p>
    </div>

    <div className="celebration-share__formats" role="group" aria-label="Image format">
      <button type="button" aria-pressed={format === 'story'} className={format === 'story' ? 'is-selected' : ''} onClick={() => { setFormat('story'); setFeedback(''); }}><Smartphone size={16} aria-hidden="true" /> Story <small>9:16</small></button>
      <button type="button" aria-pressed={format === 'post'} className={format === 'post' ? 'is-selected' : ''} onClick={() => { setFormat('post'); setFeedback(''); }}><ImageIcon size={16} aria-hidden="true" /> Post <small>1:1</small></button>
    </div>

    <div className="celebration-share__stage">
      <div className={`celebration-share__card celebration-share__card--${format}`} role="img" aria-label={`Shareable ${format} preview: My next chapter starts here at ${institutionName}`}>
        {photoAvailable && <img src={PHOTO_PATH} alt="" onError={() => setPhotoAvailable(false)} />}
        <span className="celebration-share__shade" aria-hidden="true" />
        <span className="celebration-share__light" aria-hidden="true" />
        <span className="celebration-share__star celebration-share__star--large" aria-hidden="true">✦</span>
        <span className="celebration-share__star celebration-share__star--small" aria-hidden="true">✦</span>
        <span className="celebration-share__brand"><GraduationCap size={18} aria-hidden="true" /> {institutionName}</span>
        <span className="celebration-share__arrival"><ArrowUpRight size={15} aria-hidden="true" /> The gates are open</span>
        <span className="celebration-share__card-copy"><small>MOMENT UNLOCKED <span aria-hidden="true">✦</span></small><strong>My next chapter<br /><em>starts here.</em></strong></span>
        <span className="celebration-share__card-footer">THE JOURNEY IS JUST BEGINNING</span>
      </div>
    </div>

    <div className="celebration-share__actions">
      <button type="button" className="celebration-share__share" disabled={busy} onClick={() => void exportImage(true)}><Share2 size={17} aria-hidden="true" /> {busy ? 'Preparing image…' : 'Share image'}</button>
      <button type="button" className="celebration-share__download" disabled={busy} onClick={() => void exportImage(false)}><Download size={17} aria-hidden="true" /> Download PNG</button>
    </div>
    <div className="celebration-share__caption"><p>{caption}</p><button type="button" onClick={() => void copyCaption()} aria-label="Copy suggested caption"><Copy size={15} aria-hidden="true" /> Copy</button></div>
    <p className="celebration-share__privacy"><Check size={14} aria-hidden="true" /> No legal name, ID details, or enrollment status appears on the image.</p>
    <p className="celebration-share__feedback" role="status" aria-live="polite">{feedback}</p>
  </section>;
}
