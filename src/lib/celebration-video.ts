export type ShareFormat = 'story' | 'announcement';

const PHOTO_PATH = `${import.meta.env.BASE_URL}campus-northbridge.png`;
const DURATION_MS = 5200;

function loadCampusPhoto(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const photo = new Image();
    photo.onload = () => resolve(photo);
    photo.onerror = () => resolve(null);
    photo.src = PHOTO_PATH;
  });
}

function preparePhoto(photo: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const prepared = document.createElement('canvas');
  prepared.width = Math.ceil(width * 1.12);
  prepared.height = Math.ceil(height * 1.12);
  const ctx = prepared.getContext('2d');
  if (!ctx) throw new Error('Video export is not available in this browser.');
  const scale = Math.max(prepared.width / photo.naturalWidth, prepared.height / photo.naturalHeight);
  const drawnWidth = photo.naturalWidth * scale;
  const drawnHeight = photo.naturalHeight * scale;
  ctx.drawImage(photo, (prepared.width - drawnWidth) * .28, (prepared.height - drawnHeight) / 2, drawnWidth, drawnHeight);
  return prepared;
}

function paintPhoto(ctx: CanvasRenderingContext2D, prepared: HTMLCanvasElement, width: number, height: number, progress: number) {
  const spareX = prepared.width - width;
  const spareY = prepared.height - height;
  ctx.drawImage(prepared, -spareX * (.45 + progress * .1), -spareY * (.45 + progress * .08));
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x + size * .18, y - size * .18, x + size, y);
  ctx.quadraticCurveTo(x + size * .18, y + size * .18, x, y + size);
  ctx.quadraticCurveTo(x - size * .18, y + size * .18, x - size, y);
  ctx.quadraticCurveTo(x - size * .18, y - size * .18, x, y - size);
  ctx.closePath();
  ctx.fill();
}

function drawStory(ctx: CanvasRenderingContext2D, photo: HTMLCanvasElement | null, progress: number, institutionName: string, width: number, height: number) {
  ctx.fillStyle = '#173f43';
  ctx.fillRect(0, 0, width, height);
  if (photo) paintPhoto(ctx, photo, width, height, progress);
  const shade = ctx.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, 'rgba(8,31,41,.69)');
  shade.addColorStop(.35, 'rgba(8,31,41,.02)');
  shade.addColorStop(.7, 'rgba(8,31,41,.5)');
  shade.addColorStop(1, '#071f2b');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = .7 + Math.sin(progress * Math.PI * 4) * .25;
  ctx.fillStyle = '#e5eeba';
  star(ctx, width - 104, 225, 36);
  star(ctx, width - 176, 290, 13);
  ctx.restore();

  ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff';
  ctx.font = '800 28px Montserrat, Arial, sans-serif';
  ctx.fillText(institutionName, 54, 66, width - 108);

  ctx.fillStyle = '#fffdf1';
  ctx.beginPath();
  ctx.roundRect(54, height * .53, 342, 56, 28);
  ctx.fill();
  ctx.fillStyle = '#174e50';
  ctx.font = '800 18px Montserrat, Arial, sans-serif';
  ctx.fillText('↗  THE GATES ARE OPEN', 75, height * .53 + 18, 305);

  ctx.fillStyle = '#e5eeba';
  ctx.font = '800 21px Montserrat, Arial, sans-serif';
  ctx.fillText('MOMENT UNLOCKED  ✦', 54, height - 326);
  ctx.fillStyle = '#fff';
  ctx.font = '750 70px Montserrat, Arial, sans-serif';
  ctx.fillText('My next chapter', 54, height - 265, width - 108);
  ctx.font = 'italic 78px Georgia, serif';
  ctx.fillText('starts here.', 54, height - 178, width - 108);
  ctx.font = '800 17px Montserrat, Arial, sans-serif';
  ctx.fillText('THE JOURNEY IS JUST BEGINNING', 54, height - 57);
}

function drawAnnouncement(ctx: CanvasRenderingContext2D, photo: HTMLCanvasElement | null, progress: number, institutionName: string) {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = '#f5f1e7';
  ctx.fillRect(0, 0, width, height);

  const imageHeight = Math.round(height * .46);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, imageHeight);
  ctx.clip();
  if (photo) paintPhoto(ctx, photo, width, imageHeight, progress);
  const imageShade = ctx.createLinearGradient(0, 0, 0, imageHeight);
  imageShade.addColorStop(0, 'rgba(5,31,39,.25)');
  imageShade.addColorStop(1, 'rgba(5,31,39,.72)');
  ctx.fillStyle = imageShade;
  ctx.fillRect(0, 0, width, imageHeight);
  ctx.restore();

  ctx.fillStyle = '#e4edc0';
  ctx.save();
  ctx.globalAlpha = .68 + Math.sin(progress * Math.PI * 4) * .25;
  star(ctx, width - 100, 114, 42);
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.font = '800 27px Montserrat, Arial, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(institutionName, 55, 60, width - 110);

  ctx.fillStyle = '#dfd1a8';
  ctx.beginPath();
  ctx.arc(105, imageHeight, 65, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e5353';
  ctx.beginPath();
  ctx.arc(105, imageHeight, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f9f3e4';
  ctx.font = '700 74px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', 105, imageHeight - 49);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#23615c';
  ctx.font = '800 18px Montserrat, Arial, sans-serif';
  ctx.fillText('I’M HAPPY TO ANNOUNCE', 55, imageHeight + 86);
  ctx.fillStyle = '#172e3d';
  ctx.font = '700 52px Montserrat, Arial, sans-serif';
  ctx.fillText('I got accepted to', 55, imageHeight + 133, width - 110);
  ctx.font = 'italic 58px Georgia, serif';
  ctx.fillText('Northbridge University.', 55, imageHeight + 201, width - 100);
  ctx.fillStyle = '#425868';
  ctx.font = '500 27px Montserrat, Arial, sans-serif';
  ctx.fillText('Computer Science · Class of 2027', 55, imageHeight + 283, width - 110);
  ctx.fillStyle = '#c5ac73';
  ctx.fillRect(55, height - 64, width - 110, 2);
  ctx.fillStyle = '#23615c';
  ctx.font = '800 15px Montserrat, Arial, sans-serif';
  ctx.fillText('A NEW CHAPTER BEGINS', 55, height - 48);
}

export function supportedVideoMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement === 'undefined' || !HTMLCanvasElement.prototype.captureStream) return null;
  return ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    .find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

export async function makeCelebrationVideo(format: ShareFormat, institutionName: string): Promise<{ blob: Blob; extension: 'mp4' | 'webm' }> {
  const mimeType = supportedVideoMimeType();
  if (!mimeType) throw new Error('Video export is not supported in this browser.');
  await document.fonts?.ready;
  const photo = await loadCampusPhoto();
  const canvas = document.createElement('canvas');
  const storyScale = .75;
  canvas.width = format === 'story' ? 540 : 720;
  canvas.height = format === 'story' ? 960 : 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Video export is not available in this browser.');
  const preparedPhoto = photo ? preparePhoto(photo, 720, format === 'story' ? 1280 : Math.round(canvas.height * .46)) : null;

  const draw = (progress: number) => {
    if (format === 'story') {
      ctx.save();
      ctx.scale(storyScale, storyScale);
      drawStory(ctx, preparedPhoto, progress, institutionName, 720, 1280);
      ctx.restore();
    } else drawAnnouncement(ctx, preparedPhoto, progress, institutionName);
  };
  draw(0);

  const stream = canvas.captureStream(24);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3_500_000 });
  const chunks: Blob[] = [];
  const result = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = () => reject(new Error('The video could not be recorded.'));
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: mimeType });
      if (!blob.size) reject(new Error('The video could not be recorded.'));
      else resolve(blob);
    };
  });
  recorder.start(250);
  const start = performance.now();
  const tick = (time: number) => {
    const progress = Math.min((time - start) / DURATION_MS, 1);
    draw(progress);
    if (progress < 1 && recorder.state === 'recording') requestAnimationFrame(tick);
    else if (recorder.state === 'recording') recorder.stop();
  };
  requestAnimationFrame(tick);
  const blob = await result;
  return { blob, extension: mimeType.includes('mp4') ? 'mp4' : 'webm' };
}
