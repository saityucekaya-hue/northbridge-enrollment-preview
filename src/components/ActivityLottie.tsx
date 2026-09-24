import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react';
import { useEffect, useState, type ReactNode } from 'react';
import learning from '../animations/learning.json';
import sporting from '../animations/sporting.json';
import debating from '../animations/debating.json';
import rowing from '../animations/rowing.json';
import rugby from '../animations/rugby.json';
import polo from '../animations/polo.json';
import soccer from '../animations/soccer.json';
import camping from '../animations/camping.json';

const activities: Record<string, Record<string, unknown>> = { learning, sporting, debating, rowing, rugby, polo, soccer, camping };

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
      data={activities[kind] ?? learning}
      autoplay
      loop
      dotLottieRefCallback={setPlayer}
      className="college-life__lottie-canvas"
      style={{ visibility: firstFrameReady ? 'visible' : 'hidden' }}
    />
  </div>;
}
