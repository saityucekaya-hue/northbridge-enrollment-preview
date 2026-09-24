import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react';
import { useEffect, useState, type ReactNode } from 'react';

export default function ActivityLottie({ kind, fallback }: { kind: string; fallback: ReactNode }) {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const [player, setPlayer] = useState<DotLottie | null>(null);
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  useEffect(() => {
    if (!player) return;
    const showFirstFrame = () => setFirstFrameReady(true);
    player.addEventListener('render', showFirstFrame);
    return () => player.removeEventListener('render', showFirstFrame);
  }, [player]);

  if (reducedMotion) return <div className="college-life__lottie">{fallback}</div>;

  return <div className="college-life__lottie" aria-hidden="true" data-activity={kind}>
    {!firstFrameReady && fallback}
    <DotLottieReact
      src={`${import.meta.env.BASE_URL}animations/${kind}.json`}
      autoplay
      loop
      dotLottieRefCallback={setPlayer}
      className="college-life__lottie-canvas"
      style={{ visibility: firstFrameReady ? 'visible' : 'hidden' }}
    />
  </div>;
}
