import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function SkateboardLottie() {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  return <div className="college-life__lottie" aria-hidden="true">
    <DotLottieReact
      src={`${import.meta.env.BASE_URL}animations/skateboard.lottie`}
      autoplay={!reducedMotion}
      loop={!reducedMotion}
      className="college-life__lottie-canvas"
    />
  </div>;
}
