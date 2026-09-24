import { afterEach, expect, it, vi } from 'vitest';
import { makeCelebrationVideo } from './celebration-video';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it('records both public card designs as actual video blobs without student identity', async () => {
  class TestRecorder {
    static isTypeSupported(type: string) { return type.startsWith('video/mp4'); }
    state: RecordingState = 'inactive';
    ondataavailable: ((event: BlobEvent) => void) | null = null;
    onstop: (() => void) | null = null;
    onerror: (() => void) | null = null;
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      this.ondataavailable?.({ data: new Blob(['recorded frames']) } as BlobEvent);
      this.onstop?.();
    }
  }
  vi.stubGlobal('MediaRecorder', TestRecorder);
  vi.stubGlobal('Image', class {
    naturalWidth = 1400;
    naturalHeight = 1000;
    onload: (() => void) | null = null;
    set src(_value: string) { this.onload?.(); }
  });
  vi.spyOn(performance, 'now').mockReturnValue(0);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(5300), 0));
  const originalCaptureStream = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'captureStream');
  Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', { configurable: true, value: () => ({ getTracks: () => [{ stop: vi.fn() }] }) });
  const fillText = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
    return {
      canvas: this, fillText, fillRect: vi.fn(), drawImage: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(),
      quadraticCurveTo: vi.fn(), closePath: vi.fn(), fill: vi.fn(), roundRect: vi.fn(), arc: vi.fn(),
      rect: vi.fn(), clip: vi.fn(), save: vi.fn(), restore: vi.fn(), scale: vi.fn(),
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
    } as unknown as CanvasRenderingContext2D;
  });

  try {
    const story = await makeCelebrationVideo('story', 'Northbridge University');
    const announcement = await makeCelebrationVideo('announcement', 'Northbridge University');
    expect(story.extension).toBe('mp4');
    expect(announcement.extension).toBe('mp4');
    expect(story.blob.size).toBeGreaterThan(0);
    expect(announcement.blob.size).toBeGreaterThan(0);
    const drawnText = fillText.mock.calls.map((call) => String(call[0])).join(' ');
    expect(drawnText).toContain('I got accepted to');
    expect(drawnText).toContain('My next chapter');
    expect(drawnText).not.toContain('Jordan Lee');
  } finally {
    if (originalCaptureStream) Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', originalCaptureStream);
    else Reflect.deleteProperty(HTMLCanvasElement.prototype, 'captureStream');
  }
});
