import { useId, useState } from 'react';
import { ArrowUpRight, Download, GraduationCap, Image as ImageIcon, Smartphone, Sparkles } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { makeCelebrationVideo, supportedVideoMimeType, type ShareFormat } from '../lib/celebration-video';
import './celebration-share-card.css';

type CelebrationShareCardProps = {
  institutionName?: string;
};

const PHOTO_PATH = `${import.meta.env.BASE_URL}campus-northbridge.png`;

function downloadBlob(blob: Blob, format: ShareFormat, extension: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `northbridge-${format}.${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Public milestone artwork for the standalone enrollment concept. */
export function CelebrationShareCard({ institutionName = 'Northbridge University' }: CelebrationShareCardProps) {
  const headingId = useId();
  const [format, setFormat] = useState<ShareFormat>('story');
  const [photoAvailable, setPhotoAvailable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const canRecordVideo = Boolean(supportedVideoMimeType());

  async function downloadVideo() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { blob, extension } = await makeCelebrationVideo(format, institutionName);
      downloadBlob(blob, format, extension);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The video could not be created.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="celebration-share" aria-labelledby={headingId}>
    <div className="celebration-share__heading">
      <span className="celebration-share__eyebrow"><Sparkles size={15} aria-hidden="true" /> Made to share</span>
      <h3 id={headingId}>A moment worth sharing.</h3>
      <p>Pick a design, save the video, and share it where you like.</p>
    </div>

    <div className="celebration-share__formats" role="group" aria-label="Video design">
      <button type="button" aria-pressed={format === 'story'} className={format === 'story' ? 'is-selected' : ''} onClick={() => { setFormat('story'); setError(''); }}><Smartphone size={16} aria-hidden="true" /> Story <small>9:16</small></button>
      <button type="button" aria-pressed={format === 'announcement'} className={format === 'announcement' ? 'is-selected' : ''} onClick={() => { setFormat('announcement'); setError(''); }}><ImageIcon size={16} aria-hidden="true" /> Announcement <small>1:1</small></button>
    </div>

    <div className="celebration-share__stage">
      {format === 'story' ? <div className="celebration-share__card celebration-share__card--story" role="img" aria-label={`Shareable story preview: My next chapter starts here at ${institutionName}`}>
        {photoAvailable && <img src={PHOTO_PATH} alt="" onError={() => setPhotoAvailable(false)} />}
        <span className="celebration-share__shade" aria-hidden="true" />
        <span className="celebration-share__light" aria-hidden="true" />
        <span className="celebration-share__star celebration-share__star--large" aria-hidden="true">✦</span>
        <span className="celebration-share__star celebration-share__star--small" aria-hidden="true">✦</span>
        <span className="celebration-share__brand"><GraduationCap size={18} aria-hidden="true" /> {institutionName}</span>
        <span className="celebration-share__arrival"><ArrowUpRight size={15} aria-hidden="true" /> The gates are open</span>
        <span className="celebration-share__card-copy"><small>MOMENT UNLOCKED <span aria-hidden="true">✦</span></small><strong>My next chapter<br /><em>starts here.</em></strong></span>
        <span className="celebration-share__card-footer">THE JOURNEY IS JUST BEGINNING</span>
      </div> : <div className="celebration-share__card celebration-share__card--announcement" role="img" aria-label={`Shareable announcement preview: I got accepted to ${institutionName}`}>
        <div className="celebration-share__announcement-photo">
          {photoAvailable && <img src={PHOTO_PATH} alt="" onError={() => setPhotoAvailable(false)} />}
          <span className="celebration-share__announcement-brand">{institutionName}</span>
          <span className="celebration-share__announcement-spark" aria-hidden="true">✦</span>
        </div>
        <span className="celebration-share__announcement-seal" aria-hidden="true">N</span>
        <div className="celebration-share__announcement-copy">
          <small>I’M HAPPY TO ANNOUNCE</small>
          <strong>I got accepted to<br /><em>{institutionName}.</em></strong>
          <span>Computer Science · Class of 2027</span>
        </div>
        <span className="celebration-share__announcement-footer">A NEW CHAPTER BEGINS</span>
      </div>}
    </div>

    <div className="celebration-share__actions">
      <div className="celebration-share__social" role="group" aria-label="Open a social app to share">
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Instagram to share the downloaded video" title="Instagram"><FaInstagram aria-hidden="true" /></a>
        <a href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer" aria-label="Open LinkedIn to share the downloaded video" title="LinkedIn"><FaLinkedinIn aria-hidden="true" /></a>
        <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="Open X to share the downloaded video" title="X"><FaXTwitter aria-hidden="true" /></a>
        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Facebook to share the downloaded video" title="Facebook"><FaFacebookF aria-hidden="true" /></a>
      </div>
      <button type="button" className="celebration-share__download" disabled={busy || !canRecordVideo} onClick={() => void downloadVideo()} title={!canRecordVideo ? 'Video export is not supported in this browser' : undefined}><Download size={17} aria-hidden="true" /> {busy ? 'Creating video…' : 'Download video'}</button>
    </div>
    {error && <p className="celebration-share__error" role="alert">{error}</p>}
  </section>;
}
