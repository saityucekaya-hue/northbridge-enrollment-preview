export type ThemeId = 'northbridge' | 'audentra';
export type Screen = 'sign-in' | 'invitation' | 'offer' | 'contact' | 'campus' | 'enrollment' | 'documents' | 'next-steps' | 'tasks' | 'discover';
export type DocumentKind = 'governmentId' | 'profilePhoto';
export type DocumentState = 'empty' | 'selected' | 'needs-reselect';

export interface DemoDocument {
  name: string;
  state: DocumentState;
  source: 'camera' | 'file' | null;
}

export interface DemoState {
  theme: ThemeId;
  signedIn: boolean;
  offerAccepted: boolean;
  accountReady: boolean;
  campusDone: boolean;
  hasSeenNextSteps: boolean;
  email: string;
  phone: string;
  interests: string[];
  enrollmentStarted: boolean;
  governmentId: DemoDocument;
  profilePhoto: DemoDocument;
}

const storageKey = 'audentra-offer-led-preview-v2';
export const sampleEmail = 'jordan.lee@example.com';
export const samplePassword = 'Welcome2027!';
export const emptyDocument: DemoDocument = { name: '', state: 'empty', source: null };

export const themes: Record<ThemeId, { name: string; campus: string; promise: string; image: string }> = {
  northbridge: { name: 'Northbridge University', campus: 'Main campus', promise: 'Brighter thinking for a bolder tomorrow.', image: '/campus-northbridge.png' },
  audentra: { name: 'Audentra University', campus: 'Main campus', promise: 'A wider world for brighter thinkers.', image: '/campus-audentra.png' },
};

export const initialState: DemoState = {
  theme: 'northbridge', signedIn: false, offerAccepted: false, accountReady: false, campusDone: false, hasSeenNextSteps: false,
  email: sampleEmail, phone: '', interests: [], enrollmentStarted: false,
  governmentId: emptyDocument, profilePhoto: emptyDocument,
};

export function loadDemoState(): DemoState {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return initialState;
    const value = JSON.parse(raw) as Partial<DemoState>;
    const restoreDocument = (document?: DemoDocument): DemoDocument => document?.name
      ? { ...document, state: 'needs-reselect' }
      : emptyDocument;
    return {
      ...initialState, ...value,
      theme: value.theme === 'audentra' ? 'audentra' : 'northbridge',
      governmentId: restoreDocument(value.governmentId),
      profilePhoto: restoreDocument(value.profilePhoto),
    };
  } catch { return initialState; }
}

export function saveDemoState(value: DemoState): void { sessionStorage.setItem(storageKey, JSON.stringify(value)); }
export function clearDemoState(): void { sessionStorage.removeItem(storageKey); }

export const screenPath: Record<Screen, string> = {
  'sign-in': '/sign-in', invitation: '/invitation?token=sample-invitation', offer: '/onboarding/offer',
  contact: '/onboarding/contact', campus: '/onboarding/campus', enrollment: '/onboarding/enrollment',
  documents: '/onboarding/documents', 'next-steps': '/onboarding/next-steps', tasks: '/onboarding/tasks', discover: '/onboarding/discover',
};

export function readScreen(): Screen {
  const path = window.location.pathname;
  if (path === '/invitation') return 'invitation';
  const entry = Object.entries(screenPath).find(([, url]) => url === path);
  return (entry?.[0] as Screen | undefined) ?? 'sign-in';
}

export const stageNames = ['My offer', 'Contact & access', 'Campus life', 'Enrollment', 'Next steps'];

export function stageIndex(screen: Screen): number {
  if (screen === 'offer') return 0;
  if (screen === 'contact') return 1;
  if (screen === 'campus') return 2;
  if (screen === 'enrollment' || screen === 'documents') return 3;
  if (screen === 'next-steps' || screen === 'tasks' || screen === 'discover') return 4;
  return -1;
}

export function validatePassword(password: string, confirmation: string): string | null {
  if (password.length < 12) return 'Use 12 or more characters.';
  if (password !== confirmation) return 'The passwords do not match.';
  return null;
}

export function validateDocument(file: File, kind: DocumentKind): string | null {
  const allowed = kind === 'profilePhoto' ? ['jpg', 'jpeg', 'png'] : ['pdf', 'jpg', 'jpeg', 'png'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowed.includes(extension)) return kind === 'profilePhoto' ? 'Choose a JPG or PNG photo.' : 'Choose a PDF, JPG, or PNG file.';
  if (file.size === 0) return 'This file is empty. Choose another file.';
  if (file.size > 10 * 1024 * 1024) return 'Choose a file smaller than 10 MB.';
  return null;
}
