export type TaskStatus = 'todo' | 'review' | 'done';
export type TaskKind = 'upload' | 'sign' | 'housing' | 'payment' | 'profile' | 'health' | 'event';
export type SortMode = 'smart' | 'due' | 'fastest';
export interface EnrollmentTask { id: string; title: string; description: string; minutes: number; points: number; kind: TaskKind; status: TaskStatus; action: string; due?: string; prerequisite?: string; actionNeeded?: boolean; }
export const sampleTasks: EnrollmentTask[] = [
  { id: 'transcript', title: 'Final transcript', description: 'Upload your final official transcript.', minutes: 10, points: 100, kind: 'upload', status: 'todo', action: 'Upload transcript', actionNeeded: true, due: '2027-07-15' },
  { id: 'ferpa', title: 'FERPA access', description: 'Review and set your preferences.', minutes: 5, points: 100, kind: 'sign', status: 'todo', action: 'Manage access', due: '2027-07-22' },
  { id: 'housing', title: 'Housing preference', description: 'Tell us your residence hall preference.', minutes: 12, points: 100, kind: 'housing', status: 'todo', action: 'Choose housing', due: '2027-07-28' },
  { id: 'deposit', title: 'Enrollment deposit', description: 'Available after transcript approval.', minutes: 5, points: 100, kind: 'payment', status: 'todo', action: 'View prerequisite', prerequisite: 'transcript', due: '2027-08-05' },
  { id: 'photo', title: 'Photo ID', description: 'Your submission is with Admissions.', minutes: 8, points: 100, kind: 'upload', status: 'review', action: 'View submission' },
  { id: 'profile', title: 'Complete profile', description: 'Your basic information is on file.', minutes: 4, points: 100, kind: 'profile', status: 'done', action: 'View details' },
  { id: 'health', title: 'Health records', description: 'Your records are on file.', minutes: 5, points: 100, kind: 'health', status: 'done', action: 'View submission' },
  { id: 'orientation', title: 'Orientation registration', description: 'You’re registered for orientation.', minutes: 3, points: 100, kind: 'event', status: 'done', action: 'View details' },
];
export const enrollmentStorageKey = 'northbridge-enrollment-preview-v1';
export function loadEnrollmentTasks(): EnrollmentTask[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(enrollmentStorageKey) || 'null');
    if (Array.isArray(saved)) return sampleTasks.map(task => {
      const value = saved.find((item: unknown) => typeof item === 'object' && item !== null && 'id' in item && item.id === task.id);
      // Only editable preview transitions can survive refresh. Never restore arbitrary records.
      const status = value?.status;
      if ((task.id === 'housing' || task.id === 'ferpa') && status === 'done') return { ...task, status: 'done', action: 'View details' };
      if (task.id === 'transcript' && status === 'review') return { ...task, status: 'review', description: 'Your submission is with Admissions.', action: 'View submission' };
      return { ...task };
    });
  } catch { /* Storage is optional for this local preview. */ }
  return sampleTasks.map(task => ({ ...task }));
}
export function orderTasks(tasks: EnrollmentTask[], sort: SortMode): EnrollmentTask[] {
  return [...tasks].sort((a, b) => {
    const dependency = Number(Boolean(a.prerequisite)) - Number(Boolean(b.prerequisite));
    if (dependency) return dependency;
    if (sort === 'fastest') return a.minutes - b.minutes;
    return (a.due || '9999').localeCompare(b.due || '9999');
  });
}
export const mountainStops = [[455, 273], [565, 241], [492, 211], [615, 183], [556, 153], [665, 125], [621, 96], [675, 57]] as const;
export function mountainPosition(completed: number) { return mountainStops[Math.max(0, Math.min(7, completed - 1))]; }

// Attention is an explicit task flag, independent of the ToDo section.
export function needsAction(task: EnrollmentTask): boolean { return task.status === 'todo' && task.actionNeeded === true && !task.prerequisite; }
