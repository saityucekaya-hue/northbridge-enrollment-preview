import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyEnrollment } from './screens/MyEnrollment';
import { enrollmentStorageKey, loadEnrollmentTasks, needsAction, mountainPosition, orderTasks, sampleTasks } from './lib/enrollment-preview';

beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('PREVIEW-ENROLLMENT — student task journey', () => {
  it('shows vertical status sections with explicit counts and independent toggles', async () => {
    const user = userEvent.setup(); render(<MyEnrollment />);
    expect(screen.getByRole('group', { name: 'Filter by status' })).toBeVisible();
    for (const name of ['ToDo 4 items', 'In Review 1 item', 'Done 3 items']) {
      expect(screen.getByRole('button', { name, expanded: true })).toBeVisible();
    }
    expect(screen.getAllByRole('article')).toHaveLength(8);
    await user.click(screen.getByRole('button', { name: 'ToDo 4 items' }));
    expect(screen.queryByRole('article', { name: 'Final transcript' })).not.toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Photo ID' })).toBeVisible();
    expect(screen.getByRole('article', { name: 'Complete profile' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'ToDo 4 items' }));
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });
  it('sorts within vertical sections and preserves task metadata', async () => {
    const user = userEvent.setup(); render(<MyEnrollment />);
    await user.click(screen.getByRole('button', { name: /^Sort tasks:/ }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Fastest' }));
    const todo = within(screen.getByRole('region', { name: 'ToDo tasks' }));
    expect(screen.getByRole('button', { name: /^Sort tasks:/ })).toBeVisible();
    expect(todo.getByRole('button', { name: 'ToDo 4 items' })).toHaveAttribute('aria-expanded', 'true');
    expect(todo.getAllByRole('article')[0]).toHaveAccessibleName('FERPA access');
    expect(screen.getByRole('article', { name: 'Photo ID' })).toBeVisible();
    const card = screen.getByRole('article', { name: 'Final transcript' });
    expect(card).toHaveTextContent('10 mins'); expect(card).toHaveTextContent('+100 pts');
    expect(card).not.toHaveTextContent(/About|Jul|Blocked/);
    expect(screen.queryByRole('textbox', { name: 'Search enrollment tasks' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Filters' })).not.toBeInTheDocument();
  });
  it('filters by task labels without renaming sections and keeps sorting available', async () => {
    const user = userEvent.setup(); render(<MyEnrollment />);
    const filters = within(screen.getByRole('group', { name: 'Filter by status' }));
    for (const [label, heading, count] of [['Action needed', 'ToDo', 1], ['In review', 'In Review', 1], ['Done', 'Done', 3]] as const) {
      await user.click(filters.getByRole('button', { name: label }));
      expect(screen.getAllByRole('article')).toHaveLength(count);
      expect(screen.getByRole('heading', { name: `${heading} ${count} ${count === 1 ? 'item' : 'items'}` })).toBeVisible();
      for (const card of screen.getAllByRole('article')) {
        if (label === 'Action needed') expect(within(card).getByText(label)).toBeVisible();
        else expect(card.querySelector('.en-task-status')).toBeNull();
      }
      await user.click(screen.getByRole('button', { name: /^Sort tasks:/ }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Fastest' }));
      expect(screen.getAllByRole('article')).toHaveLength(count);
    }
    await user.click(filters.getByRole('button', { name: 'All tasks' }));
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });
  it('treats attention as an explicit flag rather than every ToDo', () => {
    expect(sampleTasks.filter(needsAction).map(task => task.id)).toEqual(['transcript']);
    const task = sampleTasks[0];
    expect(needsAction({ ...task, status: 'review' })).toBe(false);
    expect(needsAction({ ...task, status: 'done' })).toBe(false);
    expect(needsAction({ ...task, prerequisite: 'other' })).toBe(false);
    expect(needsAction({ ...task, actionNeeded: false })).toBe(false);
  });
  it('does not award points or move the mountain for a prerequisite view', async () => {
    const user = userEvent.setup(); render(<MyEnrollment />);
    await user.click(screen.getByRole('button', { name: 'View prerequisite' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('needs to be approved');
    await user.click(screen.getByRole('button', { name: 'Back to enrollment' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  });
  it('validates housing, saves once, earns points and moves to the next mountain checkpoint', async () => {
    const user = userEvent.setup(); render(<MyEnrollment />);
    await user.click(screen.getByRole('button', { name: 'Choose housing' }));
    await user.click(screen.getByRole('button', { name: 'Save preference' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose your housing preference');
    await user.click(screen.getByRole('radio', { name: 'On campus' }));
    await user.click(screen.getByRole('button', { name: 'Save preference' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4');
    expect(screen.getByRole('status')).toHaveTextContent('+100 pts');
    expect(within(screen.getByRole('complementary', { name: 'Main navigation' })).getByRole('region', { name: 'Points earned' })).toHaveTextContent('400 pts earned');
    await user.click(within(screen.getByRole('article', { name: 'Housing preference' })).getByRole('button', { name: 'View details' }));
    expect(screen.queryByRole('button', { name: 'Save preference' })).not.toBeInTheDocument();
    expect(loadEnrollmentTasks().find(task => task.id === 'housing')?.status).toBe('done');
  });
  it('keeps document submission in review without awarding completion', async () => {
    const user = userEvent.setup(); render(<MyEnrollment />);
    await user.click(screen.getByRole('button', { name: 'Upload transcript' }));
    await user.click(screen.getByRole('button', { name: 'Submit for review' }));
    expect(screen.getByRole('alert')).toBeVisible();
    await user.upload(screen.getByLabelText(/Choose transcript/), new File(['synthetic transcript'], 'sample-transcript.pdf', { type: 'application/pdf' }));
    await user.click(screen.getByRole('button', { name: 'Submit for review' }));
    expect(screen.getByRole('button', { name: 'In Review 2 items' })).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    expect(within(screen.getByRole('article', { name: 'Final transcript' })).getByRole('button', { name: 'View submission' })).toBeVisible();
    expect(sessionStorage.getItem(enrollmentStorageKey)).not.toContain('sample-transcript.pdf');
  });
  it('navigates full months with matching deadlines', async () => {
    const user = userEvent.setup(); render(<MyEnrollment />);
    expect(screen.queryByText('Northbridge design preview · Sample data')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Done 3 items' }));
    await user.click(screen.getByRole('button', { name: '15 Jul Final transcript' }));
    expect(screen.getByRole('dialog', { name: 'Final transcript' })).toBeVisible();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('August 2027')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'August 2027 5, Enrollment deposit' }));
    expect(screen.getByRole('region', { name: 'Enrollment calendar' })).toHaveTextContent('Enrollment deposit');
    await user.click(screen.getByRole('button', { name: '5 Aug Enrollment deposit' }));
    expect(screen.getByRole('dialog', { name: 'Enrollment deposit' })).toHaveTextContent('Your final transcript needs to be approved');
  });
  it('does not trust corrupt storage or unsupported status transitions', () => {
    sessionStorage.setItem(enrollmentStorageKey, JSON.stringify([{ id: 'transcript', status: 'done' }, { id: 'housing', status: 'done' }]));
    expect(loadEnrollmentTasks().find(task => task.id === 'transcript')?.status).toBe('todo');
    expect(loadEnrollmentTasks().find(task => task.id === 'housing')?.status).toBe('done');
    sessionStorage.setItem(enrollmentStorageKey, '{broken');
    expect(loadEnrollmentTasks()).toHaveLength(8);
  });
  it('keeps prerequisites last and bounds animation coordinates', () => {
    const tasks = sampleTasks.filter(task => task.status === 'todo');
    expect(orderTasks(tasks, 'fastest').map(task => task.id)).toEqual(['ferpa', 'transcript', 'housing', 'deposit']);
    expect(mountainPosition(99)).toEqual(mountainPosition(8));
    expect(mountainPosition(-1)).toEqual(mountainPosition(1));
  });
});
